'use strict';

const chalk = require('chalk');
const createServer = require('../../../src/server/createServer');
const webpackAdapter = require('../../../src/adapter');

module.exports = function runServe(api, isDev, { type, onlyNode, progress, port, host }) {
    // [ 'post', 'host', 'contentBase', 'entrys', 'hooks' ]; // serverConfig
    const startInfo = {
        type,
        config: api.config,
        serverConfig: api.serverConfig,
        onlyNode,
        isDev,
        port, host,
    };

    if (isDev && !onlyNode) {
        const { compiler, devOptions, webpackConfig } = webpackAdapter(api, Object.assign({}, startInfo, { progress }));

        startInfo.compiler = compiler;
        startInfo.devOptions = devOptions;
        startInfo.webpackConfig = webpackConfig;

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
