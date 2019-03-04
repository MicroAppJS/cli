#!/usr/bin/env node
'use strict';

const program = require('commander');
const microApp = require('@micro-app/core');
const chalk = require('chalk').default;

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .parse(process.argv);

global.extraArgs = program.args;

const type = program.type;
if (type === 'vusion') {
    microApp.vusion.build().then(() => {
        console.info('>>> Build Success >>>');
    }).catch(e => {
        console.error('>>> Build Error >>>', e);
    });
} else if (!type || type === 'webpack') {
    // webpack build ...
    microApp.webpack.build().then(() => {
        console.info('>>> Build Success >>>');
    }).catch(e => {
        console.error('>>> Build Error >>>', e);
    });
} else {
    console.warn(chalk.red(`Not Support < ${type} >`));
}
