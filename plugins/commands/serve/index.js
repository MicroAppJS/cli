'use strict';

const chalk = require('chalk');
const registerMethods = require('./methods');
const registerVusionMethods = require('./vusionMethods');
const runServe = require('./runServe');

module.exports = function serveCommand(api, opts) {

    registerMethods(api);

    // vusion
    registerVusionMethods(api);

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
        return runServe(api, false, { type, onlyNode, host, port });
    });

    // serve
    api.registerCommand('serve', {
        description: 'runs server for development',
        usage: 'micro-app serve [options]',
        options: {
            '-': 'default webpack.',
            '-t <type>': 'adapter type, eg. [ webpack, vusion ].',
            '-h <host>': 'node server host.',
            '-p <port>': 'node server port.',
            '--only-node': 'only run node server.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app serve -t vusion
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';
        const type = args.t || 'webpack';
        const onlyNode = args.onlyNode || false;
        const host = args.h;
        const port = args.p;
        return runServe(api, true, { type, onlyNode, host, port });
    });
};
