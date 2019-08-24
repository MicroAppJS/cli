'use strict';

const chalk = require('chalk');
const createServer = require('../../../src/server/createServer');

module.exports = function runServe(api, isDev, { type, onlyNode }) {
    const webpackConfig = api.getState('webpackConfig');

    let webpackCompiler;
    let webpackDevOptions;

    if (isDev) {
        if (type === 'vusion') {
            const vusionAdapter = require('../../../src/adapter/vusion')(webpackConfig, isDev, {
                modifyDefaultVusionConfig(vusionConfig) {
                    return api.applyPluginHooks('modifyDefaultVusionConfig', vusionConfig);
                },
                resolveVusionConfig(vusionConfig) {
                    return api.applyPluginHooks('modifyVusionConfig', vusionConfig);
                },
                resolveVusionWebpackConfig(vusionWebpackConfig) {
                    return api.applyPluginHooks('modifyVusionWebpackConfig', vusionWebpackConfig);
                },
            });
            webpackCompiler = vusionAdapter.compiler;
            webpackDevOptions = vusionAdapter.devOptions || {};
        } else {
            const webpackAdapter = require('../../../src/adapter/webpack')(webpackConfig, isDev);
            webpackCompiler = webpackAdapter.compiler;
            webpackDevOptions = webpackAdapter.devOptions || {};
        }
    }

    // 更新一次
    api.setState('webpackConfig', webpackConfig);

    const { compiler, devOptions = {} } = api.applyPluginHooks('modifyWebpackCompiler', {
        type,
        webpackConfig,
        compiler: webpackCompiler,
        devOptions: webpackDevOptions,
    });

    // [ 'post', 'host', 'contentBase', 'entrys', 'hooks' ]; // serverConfig
    const startInfo = Object.assign({
        type,
        config: api.config,
        serverConfig: api.serverConfig,
        onlyNode,
        webpackConfig,
        devOptions,
        isDev,
    }, isDev ? {
        compiler,
    } : {});

    if (isDev) {
        api.applyPluginHooks('beforeDevServer', startInfo);
    }
    return createServer(startInfo, api)
        .then(({ url }) => {
            api.logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
            if (isDev) {
                api.applyPluginHooks('afterDevServer', startInfo);
            }
        }).catch(() => {
            if (isDev) {
                api.applyPluginHooks('afterDevServer', startInfo);
            }
        });
};
