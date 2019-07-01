#!/usr/bin/env node
'use strict';

const program = require('commander');
const microApp = require('@micro-app/core');
const chalk = require('chalk').default;

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .parse(process.argv);

process.env.NODE_ENV = 'production';

global.extraArgs = program.args;

const type = program.type;
if (type === 'vusion') {
    const vusionAdapter = new microApp.VusionAdapter();
    vusionAdapter.build().then(() => {
        console.info('>>> Build Success >>>');
    }).catch(e => {
        console.error('>>> Build Error >>>', e);
    });
} else if (!type || type === 'webpack') {
    // webpack build ...
    const webpackAdapter = new microApp.WebpackAdapter();
    webpackAdapter.build().then(() => {
        console.info('>>> Build Success >>>');
    }).catch(e => {
        console.error('>>> Build Error >>>', e);
    });
} else {
    console.warn(chalk.red(`Not Support < ${type} >`));
}
