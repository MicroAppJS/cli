'use strict';

const chalk = require('chalk');
const tryRequire = require('try-require');
const _ = require('lodash');

module.exports = function adapter(api, { type, isDev, progress }) {
    const logger = api.logger;
    let _webpackConfig = api.getState('webpackConfig');
    let _webpackDevOptions = {};

    if (type === 'vusion') {
        const vusionAdapter = require('./vusion')(_webpackConfig, isDev, {
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
        _webpackConfig = vusionAdapter.webpackConfig;
        _webpackDevOptions = vusionAdapter.devOptions || {};
    }

    const webpack = tryRequire('webpack');

    const { compiler, devOptions = {}, webpackConfig } = api.applyPluginHooks('modifyWebpackCompiler', {
        type,
        isDev,
        compiler: webpack && _.isFunction(webpack) ? webpack(_webpackConfig) : null,
        webpackConfig: _webpackConfig,
        devOptions: _webpackDevOptions || {},
    });

    if (
        !_.isObject(compiler) || !compiler
        ||
        !_.isPlainObject(devOptions) || !devOptions
        ||
        !_.isPlainObject(webpackConfig) || !webpackConfig
    ) {
        logger.error('[Plugin] modifyWebpackCompiler must return { compiler, devOptions, webpackConfig }');
        return progress.exit(1);
    }

    // 更新一次
    api.setState('webpackConfig', webpackConfig);

    if (progress && webpack && webpack.ProgressPlugin) {
        try {
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
        } catch (error) {
            logger.warn(error);
        }
    }

    return { compiler, devOptions, webpackConfig };
};
