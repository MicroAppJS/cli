'use strict';

module.exports = function devCommand(api, opts) {

    const chalk = require('chalk');
    const tryRequire = require('try-require');
    const _ = require('lodash');

    // serve
    api.registerCommand('serve', {
        description: 'runs server for development',
        usage: 'micro-app serve [options]',
        options: {
            '-': 'default.',
            '--type <type>': 'adapter type, eg. [ webpack, vusion, etc. ].',
            '--host <host>': 'node server host.',
            '--port <port>': 'node server port.',
            '--only-node': 'only run node server.',
            '--open-soft-link': '启用开发软链接',
            '--open-disabled-entry': '支持可配置禁用部分模块入口.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app serve --type vusion
    ${chalk.gray('# open soft link')}
    micro-app serve --type vusion --open-soft-link
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';
        return runServe(api, args);
    });

    function runServe(api, args) {
        const logger = api.logger;

        api.applyPluginHooks('beforeDevServer', { args });

        const onlyNode = args.onlyNode || false;

        if (args.t && !args.type) { // TODO 兼容, 下个版本删除
            args.type = args.t;
            logger.warn('you should be use "--type <type>"!!!');
        }

        let compiler = null;
        let devCb = false;
        if (!onlyNode) {

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

            compiler = webpack(webpackConfig);

            const progress = args.progress || false;

            if (progress && webpack && webpack.ProgressPlugin) {
                try {
                    require('../../../src/webpackPlugins/ProgressPlugin')(api, compiler);
                } catch (error) {
                    logger.warn(error);
                }
            }

            devCb = function(app, config, args) {
                // 开发模式
                api.applyPluginHooks('onDevServerMiddleware', { app, config, args, compiler, devOptions: _webpackConfig.devServer });
            };
        }

        const createServer = require('../../../src/server/createServer');

        return createServer(api, args, devCb)
            .then(({ host, port, url }) => {
                api.logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
                api.applyPluginHooks('afterDevServer', { args, host, port, url });
            }).catch(err => {
                api.applyPluginHooks('afterDevServer', { args, err });
            });
    }
};
