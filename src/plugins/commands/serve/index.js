'use strict';

module.exports = function serveCommand(api, opts) {

    const registerMethods = require('./methods');
    registerMethods(api);

    const { _, chalk } = require('@micro-app/shared-utils');

    // serve
    api.registerCommand('serve', {
        description: 'runs server for development',
        usage: 'micro-app serve [options]',
        options: {
            '--mode <mode>': 'specify env mode (default: "development")',
            '--target <target>': 'app | lib | node etc. (default: "app")',
            '--host <host>': 'node server host.',
            '--port <port>': 'node server port.',
            '--only-node': 'only run node server.',
            '--open-soft-link': '启用开发软链接',
            '--open-disabled-entry': '支持可配置禁用部分模块入口.',
        },
        details: `
Examples:
    micro-app serve
    ${chalk.gray('# mode: development')}
    micro-app serve --mode development
        `.trim(),
    }, args => {
        const logger = api.logger;

        logger.info('[serve]', `Starting ${api.mode} server...`);

        api.applyPluginHooks('beforeDevServer', { args });

        // custom server
        const createServer = api.applyPluginHooks('modifyCreateDevServer', () => {
            logger.warn('[Plugin]', 'you should be use api.modifyCreateDevServer() !');
            return Promise.resolve();
        });

        if (!createServer || !_.isFunction(createServer)) {
            logger.throw('[Plugin]', 'api.modifyCreateDevServer() must be return function !');
        }

        return createServer({ args })
            .then(({ host, port, url } = {}) => {
                logger.success('>>> Starting Success !!!');
                if (url && _.isString(url)) {
                    logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
                }
                api.applyPluginHooks('afterDevServer', { args, host, port, url });
            }).catch(err => {
                logger.error('>>> Starting Error >>>');
                console.error(err);
                api.applyPluginHooks('afterDevServer', { args, err });
            });
    });
};


module.exports.configuration = {
    description: '服务开发命令行',
};
