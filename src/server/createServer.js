'use strict';

const Koa = require('koa');
// const koaCompose = require('koa-compose');
const koaConvert = require('koa-convert');
const _ = require('lodash');
const tryRequire = require('try-require');

module.exports = function(api, args = {}) {
    const logger = api.logger;
    // const isDev = api.mode === 'development';
    logger.info(`Starting ${api.mode} server...`);

    const serverConfig = api.serverConfig;

    const app = new Koa();
    app._name = 'KOA2'; // 设置名称, 给后面插件判断使用

    // 兼容koa1的中间件
    const _use = app.use;
    app.use = x => _use.call(app, koaConvert(x));
    app.logger = logger;
    app.use((ctx, next) => {
        ctx.logger = logger;
        return next();
    });

    // init hook
    const HookEvent = require('./HookEvent');
    const _HookEvent = new HookEvent(app); // 兼容
    initHooks(_HookEvent, serverConfig, logger);

    app.on('error', error => {
        logger.error('koa server error: ', error);
    });

    api.applyPluginHooks('onServerInit', { app, args });
    applyHooks(_HookEvent, 'init');

    api.applyPluginHooks('beforeServerEntry', { app, args });
    applyHooks(_HookEvent, 'before');

    initEntrys(app, serverConfig, logger);

    api.applyPluginHooks('afterServerEntry', { app, args });
    applyHooks(_HookEvent, 'after');

    api.applyPluginHooks('onServerInitWillDone', { app, args });

    api.applyPluginHooks('onServerInitDone', { app, args });
    applyHooks(_HookEvent, 'done');

    const port = args.port || serverConfig.port || 8888;
    const host = args.host || serverConfig.host || 'localhost';
    return new Promise((resolve, reject) => {
        app.listen(port, host === 'localhost' ? '0.0.0.0' : host, err => {
            if (err) {
                logger.error(err);
                api.applyPluginHooks('onServerRunFail', { host, port, err, args });
                reject(err);
                return;
            }
            logger.success(`Server running... listen on ${port}, host: ${host}`);

            api.applyPluginHooks('onServerRunSuccess', { host, port, args });

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
