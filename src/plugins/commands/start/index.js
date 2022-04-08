'use strict';

module.exports = function startCommand(api, opts) {

    const registerMethods = require('./methods');
    registerMethods(api);

    const { _, chalk } = require('@micro-app/shared-utils');

    // start
    api.registerCommand('start', {
        description: 'runs server for production',
        usage: 'micro-app start [options]',
        options: {
            '--mode <mode>': 'specify env mode (default: "development")',
            '--target <target>': 'app | lib | node etc. (default: "app")',
            '--host <host>': 'node server host.',
            '--port <port>': 'node server port.',
        },
        details: `
Examples:
    micro-app start
        `.trim(),
    }, args => {
        const logger = api.logger;

        logger.info('[start]', `Starting ${api.mode} server...`);

        api.applyPluginHooks('beforeServer', { args });

        // custom server
        const createServer = api.applyPluginHooks('modifyCreateServer', () => {
            logger.warn('[Plugin]', 'you should be use api.modifyCreateServer() !');
            return Promise.resolve();
        });
        // const createServer = api.applyPluginHooks('modifyCreateServer', require('../../../server/createServer'));
        if (!createServer || !_.isFunction(createServer)) {
            logger.throw('[Plugin]', 'api.modifyCreateServer() must be return function !');
        }

        return createServer({ args })
            .then(({ host, port, url } = {}) => {
                logger.success('>>> Starting Success !!!');
                if (url && _.isString(url)) {
                    logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
                }
                api.applyPluginHooks('afterServer', { args, host, port, url });

                return Promise.resolve({ args, host, port, url });
            }).catch(err => {
                logger.error('>>> Starting Error >>>');
                console.error(err);
                api.applyPluginHooks('afterServer', { args, err });

                return Promise.reject({ args, err });
            });
    });
};


module.exports.configuration = {
    description: '服务启动命令行',
};
