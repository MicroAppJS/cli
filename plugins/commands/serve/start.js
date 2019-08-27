'use strict';

const chalk = require('chalk');
const runServe = require('./runServe');

module.exports = function startCommand(api, opts) {

    // start
    api.registerCommand('start', {
        description: 'runs server for production',
        usage: 'micro-app start [options]',
        options: {
            '-': 'default webpack.',
            '-t <type>': 'adapter type, eg. [ webpack, vusion ].',
            '-h <host>': 'node server host.',
            '-p <port>': 'node server port.',
            '--only-node': 'only run node server.',
            '--progress': 'show how progress is reported during a compilation.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app start -t vusion
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        const type = args.t || 'webpack';
        const onlyNode = args.onlyNode || false;
        const host = args.h;
        const port = args.p;
        const progress = args.progress;
        return runServe(api, false, { type, onlyNode, host, port, progress });
    });
};
