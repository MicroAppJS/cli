'use strict';

module.exports = function startCommand(api, opts) {

    const registerMethods = require('./methods');

    registerMethods(api);

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
        process.env.NODE_ENV = args.mode || process.env.NODE_ENV || 'production';

        const runServe = require('./serve');
        return runServe(api, args, opts);
    });
};
