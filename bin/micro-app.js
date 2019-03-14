#!/usr/bin/env node
'use strict';

const program = require('commander');
const shelljs = require('shelljs');
const chalk = require('chalk').default;

const microApp = require('@necfe/micro-app-core');
const CONSTANT = microApp.CONSTANT;
const logger = microApp.logger;

const path = require('path');

program
    .version(require('../package').version, '-v, --version')
    .option('init', 'Init a config file')
    .option('-l, --list', 'Show micros list')
    .option('-s, --show <show>', 'Show alias & shared list')
    .option('-u, --update <update>', 'Update moicros')
    .parse(process.argv);

global.extraArgs = program.args;

if (program.init) {
    const mainPath = require.resolve('@necfe/micro-app-core');
    const configPath = path.resolve(mainPath, '../../', microApp.CONSTANT.CONFIG_NAME);
    const dest = path.resolve(process.cwd(), microApp.CONSTANT.CONFIG_NAME);
    shelljs.cp('-R', configPath, dest);

    logger.success(`Init Fnished, Create: ${chalk.yellow(microApp.CONSTANT.CONFIG_NAME)}`);
}

if (program.list) {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;

    logger.logo(`${chalk.green('Micros List')}:`);
    if (micros.length) {
        micros.forEach(item => {
            logger.logo(`   * ${chalk.yellow(item)} --- ${chalk.gray(CONSTANT.SCOPE_NAME + '/' + item)}`);
        });
    } else {
        logger.logo(' [ null ] ');
    }
}

if (program.show) {
    const name = program.show;
    require('../libs/show')(name);
}

if (program.update) {
    const name = program.update;
    require('../libs/update')(name);
}
