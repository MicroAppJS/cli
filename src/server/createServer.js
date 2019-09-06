'use strict';

const Koa = require('koa');
const koaCompose = require('koa-compose');
const koaConvert = require('koa-convert');
const _ = require('lodash');
const tryRequire = require('try-require');

const HookEvent = require('./HookEvent');

module.exports = function(opts = {}, api) {
    const logger = api.logger;
    const isDev = opts.isDev || false;
    if (isDev) {
        logger.info('Dev Server Start...');
    }

    const serverConfig = opts.serverConfig;

    const app = new Koa();
    // 兼容koa1的中间件
    const _use = app.use;
    app.use = x => _use.call(app, koaConvert(x));
    app.logger = logger;
    app.use((ctx, next) => {
        ctx.logger = logger;
        return next();
    });

    // init hook
    const _HookEvent = new HookEvent(app); // 兼容
    initHooks(_HookEvent, serverConfig, logger);

    app.on('error', error => {
        logger.error('koa server error: ', error);
    });

    api.applyPluginHooks('onServerInit', { app, config: serverConfig, options: opts });
    applyHooks(_HookEvent, 'init');

    api.applyPluginHooks('beforeServerEntry', { app, config: serverConfig, options: opts });
    applyHooks(_HookEvent, 'before');

    initEntrys(app, serverConfig, logger);

    api.applyPluginHooks('afterServerEntry', { app, config: serverConfig, options: opts });
    applyHooks(_HookEvent, 'after');

    if (isDev) {
        api.applyPluginHooks('onDevServerMiddleware', { app, config: serverConfig, options: opts });
    }

    api.applyPluginHooks('onServerInitDone', { app, config: serverConfig, options: opts });
    applyHooks(_HookEvent, 'done');

    const port = opts.port || serverConfig.port || 8888;
    const host = opts.host || serverConfig.host || 'localhost';
    return new Promise((resolve, reject) => {
        app.listen(port, host === 'localhost' ? '0.0.0.0' : host, err => {
            if (err) {
                logger.error(err);
                api.applyPluginHooks('onServerRunFail', { host, port, config: serverConfig, err });
                reject(err);
                return;
            }
            console.log('\n');
            logger.success(`Server running... listen on ${port}, host: ${host}`);

            api.applyPluginHooks('onServerRunSuccess', { host, port, config: serverConfig });

            const url = `http://${host}:${port}`;
            resolve({ host, port, url });
        });
    });
};

function initEntrys(app, serverConfig, logger) {
    const { entrys = [] } = serverConfig;
    entrys.map(item => {
        const entry = tryRequire(item.link);
        return entry && { ...item, entry };
    }).filter(item => !!item).forEach(({ entry, info, options, link }) => {
        entry(app, options, info);
        logger.info(`【 ${info.name} 】Inserted`);
        logger.debug(`【 ${info.name} 】Inserted Link: ${link}`);
    });
}

function initHooks(iHook, serverConfig, logger) {
    const allHooks = serverConfig.hooks || [];

    allHooks.forEach(({ link, info, options }) => {
        if (typeof link === 'string') {
            const hook = tryRequire(link);
            if (_.isFunction(hook)) {
                hook(iHook, options, info);
                logger.info(`【 ${info.name} 】Hook inject`);
                logger.debug(`【 ${info.name} 】Hook Link: ${link}`);
            }
        } else if (typeof link === 'object') {
            Object.keys(link).forEach(key => {
                const _link = link[key];
                const hook = tryRequire(_link);
                if (_.isFunction(hook)) {
                    iHook.hooks(key, hook.bind({ info, options }));
                    logger.info(`【 ${info.name} 】Hook inject "${key}"`);
                    logger.debug(`【 ${info.name} 】Hook inject "${key}" Link: ${link}`);
                }
            });
        }
        logger.info(`【 ${info.name} 】Hook loaded`);
    });
}

function applyHooks(iHook, name) {
    if (iHook && name) {
        const args = Array.prototype.splice.call(arguments, 0, 1);
        iHook.send(name, ...args);
    }
}
