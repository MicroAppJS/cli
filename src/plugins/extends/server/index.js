'use strict';

module.exports = function extendServer(api, opts) {

    const registerMethods = require('./methods');
    registerMethods(api);

    const { _, smartMerge } = require('@micro-app/shared-utils');

    const logger = api.logger;

    api.extendMethod('parseArgv', {
        description: 'resolve parse command argv.',
    }, function() {
        return _.cloneDeep(api.context);
    });

    api.extendConfig('selfServerConfig', {
        cache: true,
        description: '当前工程下的服务配置',
    }, function() {
        const microConfig = api.selfConfig;
        const _originalConfig = microConfig.originalConfig || {};
        const _serverConfig = _originalConfig.server || {};
        return {
            ..._serverConfig,
            info: microConfig.toJSON(),
            shared: microConfig.shared,
            sharedObj: microConfig.sharedObj,
            resolveShared: microConfig.resolveShared,
        };
    });

    api.extendConfig('microsServerConfig', {
        cache: true,
        description: '当前工程下所有依赖的服务配置合集',
    }, function() {
        const selfConfig = api.selfConfig;
        const micros = api.micros;
        const microsConfig = api.microsConfig;
        const config = {};
        micros.forEach(key => {
            const microConfig = microsConfig[key];
            if (microConfig) {
                const _originalConfig = microConfig.originalConfig || {};
                const _serverConfig = _originalConfig.server || {};
                config[key] = {
                    ..._serverConfig,
                    info: _.cloneDeep(microConfig),
                    shared: microConfig.shared,
                    sharedObj: microConfig.sharedObj,
                    resolveShared: microConfig.resolveShared,
                };
            } else {
                logger.error('[microsServerConfig]', `Not Found micros: "${key}"`);
            }
        });
        config[selfConfig.key] = api.selfServerConfig;
        return config;
    });

    // ZAP: 需要优化时机 和 内容
    // merge server config
    api.extendConfig('serverConfig', {
        cache: true,
        description: '当前工程下服务端配置集合',
    }, function() {
        const selfServerConfig = api.selfServerConfig;
        const microsServerConfig = api.microsServerConfig;
        const micros = api.micros;
        // 组装 server 配置
        const mergeConfig = smartMerge(...micros.map(key => {
            const _msc = microsServerConfig[key];
            if (!_msc) return {};
            return _.pick(_msc, [
                'shared',
                'sharedObj',
                'resolveShared',
            ]);
        }), selfServerConfig);
        return Object.assign({}, mergeConfig, { root: api.root });
    });

};


module.exports.configuration = {
    description: '针对服务信息进行配置扩展.',
};
