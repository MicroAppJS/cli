'use strict';

module.exports = function buildCommand(api, opts) {

    const chalk = require('chalk');
    const tryRequire = require('try-require');
    const _ = require('lodash');
    const registerMethods = require('./methods');

    registerMethods(api);

    // start
    api.registerCommand('build', {
        description: 'build for production',
        usage: 'micro-app build [options]',
        options: {
            '-': 'default webpack.',
            '-t <type>': 'adapter type, eg. [ webpack, vusion ].',
            '--progress': 'show how progress is reported during a compilation.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app build -t vusion
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';

        return runBuild(api, args);
    });

    function runBuild(api, args) {
        const logger = api.logger;

        api.applyPluginHooks('beforeBuild', { args });

        let _webpackConfig = api.resolveWebpackConfig();

        const { webpackConfig } = api.applyPluginHooks('modifyWebpackConfig', {
            args,
            webpackConfig: _webpackConfig,
        });

        if (
            !_.isPlainObject(webpackConfig) || !webpackConfig
        ) {
            logger.error('[Plugin] modifyWebpackConfig must return { args, webpackConfig }');
            return process.exit(1);
        }

        // 更新一次
        api.setState('webpackConfig', webpackConfig);
        _webpackConfig = _.cloneDeep(webpackConfig);

        const webpack = tryRequire('webpack');
        if (!webpack) {
            logger.error('[Plugin] Not Found "webpack"!!!');
            return process.exit(1);
        }

        const compiler = webpack(webpackConfig);

        const progress = args.progress || false;

        if (progress && webpack && webpack.ProgressPlugin) {
            try {
                require('../../../src/webpackPlugins/ProgressPlugin')(api, compiler);
            } catch (error) {
                logger.warn(error);
            }
        }

        return new Promise((resolve, reject) => {
            const spinner = logger.spinner('Building for production...');
            spinner.start();
            compiler.run((err, stats) => {
                spinner.stop();
                if (err) {
                    // 在这里处理错误
                    api.applyPluginHooks('onBuildFail', { err, args });
                }

                api.applyPluginHooks('afterBuild', { args });

                if (err) {
                    return reject(err);
                }

                process.stdout.write(stats.toString(Object.assign({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false,
                }, webpackConfig.stats || {})) + '\n');

                api.applyPluginHooks('onBuildSuccess', { args });
                // 处理完成
                resolve();
            });
        }).then(() => {
            api.logger.success('>>> Build Success >>>');
        }).catch(e => {
            api.logger.error('>>> Build Error >>>', e);
        });
    }
};
