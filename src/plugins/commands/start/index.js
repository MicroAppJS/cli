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
            '--mode': 'specify env mode (default: development)',
            '--type <type>': 'adapter type, eg. [ webpack, etc. ].',
            '--host <host>': 'node server host.',
            '--port <port>': 'node server port.',
        },
        details: `
Examples:
    micro-app start
        `.trim(),
    }, args => {
        const logger = api.logger;

        // TODO 兼容, 下个版本删除
        if (args.t && !args.type) {
            args.type = args.t;
            logger.warn('you should be use "--type <type>"!!!');
        }

        for (const key of [ 'type' ]) {
            if (args[key] == null) {
                args[key] = api[key];
            }
        }

        logger.info('[start]', `Starting ${api.mode} server...`);

        // custom server
        const createServer = api.applyPluginHooks('modifyCreateServer', () => {
            logger.warn('[Plugin]', 'you should be use api.modifyCreateServer() !');
            return Promise.resolve();
        });
        // const createServer = api.applyPluginHooks('modifyCreateServer', require('../../../server/createServer'));
        if (!createServer || !_.isFunction(createServer)) {
            logger.throw('[Plugin]', 'api.modifyCreateServer() must be return function !');
        }

        api.applyPluginHooks('beforeServer', { args });

        return createServer({ args })
            .then(({ host, port, url } = {}) => {
                logger.success('>>> Starting Success !!!');
                if (url && _.isString(url)) {
                    logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
                }
                api.applyPluginHooks('afterServer', { args, host, port, url });
            }).catch(err => {
                logger.error('>>> Starting Error >>>');
                logger.error(err);
                api.applyPluginHooks('afterServer', { args, err });
            });
    });
};


module.exports.configuration = {
    description: '服务启动命令行',
};
