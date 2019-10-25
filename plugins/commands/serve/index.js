'use strict';

module.exports = function serveCommand(api, opts) {

    const registerMethods = require('./methods');

    registerMethods(api);

    const chalk = require('chalk');

    api.beforeServer(params => {
        return api.applyPluginHooks('beforeDevServer', params);
    });

    api.afterServer(params => {
        return api.applyPluginHooks('afterDevServer', params);
    });

    // serve
    api.registerCommand('serve', {
        description: 'runs server for development',
        usage: 'micro-app serve [options]',
        options: {
            '--mode': 'specify env mode (default: development)',
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
        process.env.NODE_ENV = args.mode || process.env.NODE_ENV || 'development';

        const runServe = require('../start/serve');
        return runServe(api, args, opts);
    });
};
