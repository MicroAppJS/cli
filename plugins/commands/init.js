'use strict';

const shelljs = require('shelljs');
const path = require('path');
const chalk = require('chalk');

module.exports = function initCommand(api, opts) {

    api.registerMethod('beforeCommandInit', {
        type: api.API_TYPE.EVENT,
        description: '初始化前事件',
    });
    api.registerMethod('afterCommandInit', {
        type: api.API_TYPE.EVENT,
        description: '初始化完毕后事件',
    });

    // start
    api.registerCommand('init', {
        description: 'init micro app project.',
        usage: 'micro-app init [options]',
        options: {
            '-': 'init default.',
            // '-n <name>': 'only init <name>.',
        },
        details: `
Examples:
    ${chalk.gray('# init')}
    micro-app init
          `.trim(),
    }, args => {
        return initMicro(api, args);
    });
};

function initMicro(api, args) {
    const logger = api.logger;
    const config = api.self;
    const micros = api.micros;
    const microsConfig = api.microsConfig;

    api.applyPluginHooks('beforeCommandInit', { args, logger, microsConfig, micros, config });

    const microApp = require('@micro-app/core');
    const mainPath = require.resolve('@micro-app/core');
    const from = path.resolve(mainPath, '../../', microApp.CONSTANTS.CONFIG_NAME);
    const to = path.resolve(microApp.CONSTANTS.ROOT, microApp.CONSTANTS.CONFIG_NAME);
    shelljs.cp('-R', from, to);

    api.applyPluginHooks('afterCommandInit', { args, logger, microsConfig, micros, config, from, to });

    logger.success(`Init Fnished, Create: ${chalk.yellow(microApp.CONSTANTS.CONFIG_NAME)}`);
}
