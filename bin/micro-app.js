#!/usr/bin/env node
'use strict';

const program = require('commander');
const shelljs = require('shelljs');
const chalk = require('chalk').default;

const microApp = require('@micro-app/core');

const path = require('path');

program
    .version(require('../package').version, '-v, --version')
    .option('init', 'Init a config file')
    .option('micros', 'Show micros list')
    .parse(process.argv);

global.extraArgs = program.args;

if (program.init) {
    const mainPath = require.resolve('@micro-app/core');
    const configPath = path.resolve(mainPath, '../../', microApp.CONSTANT.CONFIG_NAME);
    const dest = path.resolve(process.cwd(), microApp.CONSTANT.CONFIG_NAME);
    shelljs.cp('-Rf', configPath, dest);

    console.info(`Init ${chalk.green('Success')}: ${chalk.yellow(microApp.CONSTANT.CONFIG_NAME)}`);
}
if (program.micros) {
    const microAppConfig = microApp.self();
    const micros = microAppConfig.micros;

    console.info(`${chalk.green('Micros List')}:`);
    if (micros.length) {
        micros.forEach(item => {
            console.info(`--> ${chalk.yellow(item)}`);
        });
    } else {
        console.info(' [ null ]');
    }
}
