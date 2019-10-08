'use strict';

module.exports = function runServe(api, args, opts) {
    const chalk = require('chalk');

    const logger = api.logger;

    if (args.t && !args.type) { // TODO 兼容, 下个版本删除
        args.type = args.t;
        logger.warn('you should be use "--type <type>"!!!');
    }

    api.applyPluginHooks('beforeServer', { args });

    const createServer = require('../../../src/server/createServer');

    return createServer(api, args)
        .then(({ host, port, url }) => {
            api.logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
            api.applyPluginHooks('afterServer', { args, host, port, url });
        }).catch(err => {
            api.applyPluginHooks('afterServer', { args, err });
        });
};
