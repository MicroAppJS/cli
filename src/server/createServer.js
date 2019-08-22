'use strict';

const Koa = require('koa');
const koaCompose = require('koa-compose');
const koaConvert = require('koa-convert');

const injectAliasModule = require('./injectAliasModule');
const HookEvent = require('./HookEvent');
const staticServer = require('./staticServer');

module.exports = function(options = {}, api) {
    const logger = api.logger;
    const isDev = options.isDev || false;
    const onlyNode = options.onlyNode || false;
    const webpackAdapter = options.webpackAdapter || false;
    if (isDev) {
        logger.info('DevServer Start...');
    }

    const config = options.config;
    injectAliasModule(config.resolveShared);
    const serverConfig = options.serverConfig;

    const app = new Koa();
    // 兼容koa1的中间件
    const _use = app.use;
    app.use = x => _use.call(app, koaConvert(x));

    // init hook
    const _HookEvent = new HookEvent(app); // 兼容
    initHooks(_HookEvent, serverConfig, logger);

    app.on('error', error => {
        logger.error('koa server error: ', error);
    });

    hooks(_HookEvent, 'init');
    api.applyPluginHooks('onServerInit', { app });

    hooks(_HookEvent, 'before');
    api.applyPluginHooks('beforeServerEntry', { app });

    initEntrys(app, serverConfig, logger);

    hooks(_HookEvent, 'after');
    api.applyPluginHooks('afterServerEntry', { app });

    if (isDev) {
        if (!onlyNode && !!webpackAdapter) {
            (async () => {
                const middleware = await webpackAdapter.serve();
                app.use(middleware);
            })();
        }
    } else {
        // static file
        const { contentBase } = serverConfig;
        const koaStatic = staticServer(contentBase);
        if (koaStatic) {
            app.use(koaStatic);
        }
    }

    api.applyPluginHooks('onServerInitDone', { app });
};

function initEntrys(app, serverConfig, logger) {
    const { entrys = [] } = serverConfig;
    entrys.forEach(({ entry, info, options }) => {
        entry(app, options, info);
        logger.info(`【 ${info.name} 】Inserted`);
    });
}

function initHooks(iHook, serverConfig, logger) {
    const { hooks = [] } = serverConfig;

    hooks.forEach(({ hook, info, options }) => {
        if (typeof hook === 'function') {
            hook(iHook, options, info);
        } else if (typeof hooks === 'object') {
            Object.keys(hooks).forEach(key => {
                const func = hooks[key];
                iHook.hooks(key, func.bind({ info, options }));
                logger.info(`【 ${info.name} 】Hook inject "${key}"`);
            });
        }
        logger.info(`【 ${info.name} 】Hook loaded`);
    });
}

function hooks(iHook, name) {
    if (iHook && name) {
        const args = Array.prototype.splice.call(arguments, 0, 1);
        iHook.send(name, ...args);
    }
}
