'use strict';

module.exports = function startCommand(api, opts) {

    const chalk = require('chalk');

    // start
    api.registerCommand('start', {
        description: 'runs server for production',
        usage: 'micro-app start [options]',
        options: {
            '--mode': 'specify env mode (default: development)',
            '--type <type>': 'adapter type, eg. [ webpack, vusion, etc. ].',
            '--host <host>': 'node server host.',
            '--port <port>': 'node server port.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app start --type vusion
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        return runServe(api, args);
    });

    function runServe(api, _args) {
        const logger = api.logger;

        if (_args.t && !_args.type) { // TODO 兼容, 下个版本删除
            _args.type = _args.t;
            logger.warn('you should be use "--type <type>"!!!');
        }

        api.applyPluginHooks('beforeServer', { args: _args });

        const createServer = require('../../../src/server/createServer');

        return createServer(api, _args)
            .then(({ host, port, url }) => {
                api.logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
                api.applyPluginHooks('afterServer', { args: _args, host, port, url });
            }).catch(err => {
                api.applyPluginHooks('afterServer', { args: _args, err });
            });
    }
};
