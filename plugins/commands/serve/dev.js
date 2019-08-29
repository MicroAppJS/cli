'use strict';

const chalk = require('chalk');
const runServe = require('./runServe');

module.exports = function devCommand(api, opts) {

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
            '--open-soft-link': '启用开发软链接',
            '--open-disabled-entry': '支持可配置禁用部分模块入口.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app serve -t vusion
    ${chalk.gray('# open soft link')}
    micro-app serve -t vusion --open-soft-link
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'development';
        const type = args.t || 'webpack';
        const onlyNode = args.onlyNode || false;
        const host = args.h;
        const port = args.p;
        const progress = args.progress;
        return runServe(api, true, { type, onlyNode, host, port, progress });
    });
};
