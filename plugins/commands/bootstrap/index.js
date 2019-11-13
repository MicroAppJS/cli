'use strict';

const shelljs = require('shelljs');
const path = require('path');
const chalk = require('chalk');

module.exports = function bootstrapCommand(api, opts) {

    api.registerMethod('beforeCommandBootstrap', {
        type: api.API_TYPE.EVENT,
        description: '初始化前事件',
    });
    api.registerMethod('afterCommandBootstrap', {
        type: api.API_TYPE.EVENT,
        description: '初始化完毕后事件',
    });

    // start
    api.registerCommand('bootstrap', {
        description: 'bootstrap micro app project.',
        usage: 'micro-app bootstrap [options]',
        options: {
            '-': 'bootstrap default.',
            // '-n <name>': 'only bootstrap <name>.',
        },
        details: `
Examples:
    ${chalk.gray('# bootstrap')}
    micro-app bootstrap
          `.trim(),
    }, args => {
        return initMicro(api, args);
    });
};
