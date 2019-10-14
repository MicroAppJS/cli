'use strict';

module.exports = function extendServer(api, opts) {

    api.assertVersion('>=0.2.0');

    const registerMethods = require('./methods');
    registerMethods(api);

    const _ = require('lodash');

    const logger = api.logger;

    api.extendConfig('selfServerConfig', {
        cache: true,
        description: '当前工程下的服务配置',
    }, function() {
        const microConfig = this.selfConfig;
        const _originalConfig = microConfig.originalConfig || {};
        const _serverConfig = _originalConfig.server || {};
        const { entry, options = {}, hooks } = _serverConfig;
        return {
            // ...microConfig,
            entry,
            hooks,
            options,
            info: _.cloneDeep(microConfig),
            shared: microConfig.shared,
            sharedObj: microConfig.sharedObj,
            resolveShared: microConfig.resolveShared,
            port: _serverConfig.port,
            host: _serverConfig.host,
            proxy: _serverConfig.proxy,
        };
    });

    api.extendConfig('microsServerConfig', {
        cache: true,
        description: '当前工程下所有依赖的服务配置合集',
    }, function() {
        const selfConfig = this.selfConfig;
        const micros = api.micros;
        const microsConfig = api.microsConfig;
        const config = {};
        micros.forEach(key => {
            const microConfig = microsConfig[key];
            if (microConfig) {
                const _originalConfig = microConfig.originalConfig || {};
                const _serverConfig = _originalConfig.server || {};
                const { entry, options = {}, hooks } = _serverConfig;
                config[key] = {
                    // ...microConfig,
                    entry,
                    hooks,
                    options,
                    info: _.cloneDeep(microConfig),
                    shared: microConfig.shared,
                    sharedObj: microConfig.sharedObj,
                    resolveShared: microConfig.resolveShared,
                    port: _serverConfig.port,
                    host: _serverConfig.host,
                    proxy: _serverConfig.proxy,
                };
            } else {
                logger.error(`Not Found micros: "${key}"`);
            }
        });
        config[selfConfig.key] = api.selfServerConfig;
        return config;
    });

    api.extendConfig('serverConfig', {
        description: '当前工程下服务端配置集合',
    }, function() {
        return api.applyPluginHooks('modifyDefaultServerConfig', {});
    });

    // merge server config
    api.onInitWillDone(() => {
        const serverMerge = require('../../../src/utils/merge-server');
        const serverHooksMerge = require('../../../src/utils/merge-server-hooks');
        api.modifyDefaultServerConfig(_serverConfig => {
            const selfServerConfig = api.selfServerConfig;
            const microsServerConfig = api.microsServerConfig;
            const micros = api.micros;
            const serverEntrys = serverMerge(...micros.map(key => microsServerConfig[key]), selfServerConfig);
            const serverHooks = serverHooksMerge(...micros.map(key => microsServerConfig[key]), selfServerConfig);
            return Object.assign(_serverConfig, {
                ..._.pick(selfServerConfig, [
                    'host',
                    'port',
                ]),
                entrys: serverEntrys,
                hooks: serverHooks,
            });
        });
    });
};
