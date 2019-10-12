'use strict';

module.exports = function extendServer(api, opts) {

    api.assertVersion('>=0.2.0');

    const registerMethods = require('./methods');
    registerMethods(api);

    const requireMicro = require('@micro-app/core');
    const _ = require('lodash');

    const logger = api.logger;

    api.extendConfig('selfServerConfig', {
        cache: true,
        description: '当前工程下的服务配置',
    }, function() {
        return api.self.toServerConfig(true);
    });

    api.extendConfig('microsServerConfig', {
        cache: true,
        description: '当前工程下所有依赖的服务配置合集',
    }, function() {
        const _self = this.self;
        const config = {};
        const micros = _.cloneDeep([ ...this.micros ]);
        micros.forEach(key => {
            const microConfig = requireMicro(key);
            if (microConfig) {
                config[key] = microConfig.toServerConfig(true);
            } else {
                this.micros.delete(key);
                logger.error(`Not Found micros: "${key}"`);
            }
        });
        config[_self.key] = api.selfServerConfig || _self.toServerConfig(true);
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
