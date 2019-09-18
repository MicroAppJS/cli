'use strict';

const chalk = require('chalk');
const tryRequire = require('try-require');
const _ = require('lodash');

module.exports = function adapter(api, info) {
    const logger = api.logger;
    const _webpackConfig = api.resolveWebpackConfig();
    const _webpackDevOptions = _webpackConfig.devServer || {};

    const webpack = tryRequire('webpack');

    const { devOptions = {}, webpackConfig } = api.applyPluginHooks('modifyWebpackConfig', {
        ...info,
        webpackConfig: _.cloneDeep(_webpackConfig),
        devOptions: _webpackDevOptions || {},
    });

    if (
        !_.isPlainObject(devOptions) || !devOptions
        ||
        !_.isPlainObject(webpackConfig) || !webpackConfig
    ) {
        logger.error('[Plugin] modifyWebpackConfig must return { devOptions, webpackConfig }');
        return process.exit(1);
    }

    // 更新一次
    api.setState('webpackConfig', webpackConfig);

    const compiler = webpack(webpackConfig);

    if (info.progress && webpack && webpack.ProgressPlugin) {
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
