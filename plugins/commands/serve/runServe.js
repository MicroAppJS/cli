'use strict';

const tryRequire = require('try-require');
const chalk = require('chalk');
const createServer = require('../../../src/server/createServer');

module.exports = function runServe(api, isDev, { type, onlyNode, progress, port, host }) {
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
            if (webpackAdapter) {
                webpackCompiler = webpackAdapter.compiler;
                webpackDevOptions = webpackAdapter.devOptions || {};
            }
        }
    }

    // 更新一次
    api.setState('webpackConfig', webpackConfig);

    // [ 'post', 'host', 'contentBase', 'entrys', 'hooks' ]; // serverConfig
    const startInfo = {
        type,
        config: api.config,
        serverConfig: api.serverConfig,
        onlyNode,
        webpackConfig,
        isDev,
        port, host,
    };

    if (isDev) {
        const { compiler, devOptions = {} } = api.applyPluginHooks('modifyWebpackCompiler', {
            type,
            webpackConfig,
            compiler: webpackCompiler,
            devOptions: webpackDevOptions,
        });

        if (progress) {
            const webpack = tryRequire('webpack');
            if (webpack) {
                let spinner;
                compiler.apply(new webpack.ProgressPlugin({
                    modules: false,
                    profile: false,
                    handler: (percentage, message, ...args) => {
                        if (!spinner && percentage <= 0) {
                            spinner = api.logger.spinner('Compiling...');
                            spinner.start();
                        }
                        if (spinner) {
                            spinner.text = Number(percentage * 100).toFixed(2) + '%  ' + chalk.gray(`( ${message} )`);
                        }
                        // api.logger.logo(percentage, message, ...args);
                        if (spinner && percentage >= 1) {
                            spinner.succeed('Compiled OK!');
                            spinner = null;
                        }
                    },
                }));
            }
        }

        startInfo.compiler = compiler;
        startInfo.devOptions = devOptions;

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
