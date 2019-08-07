#!/usr/bin/env node
'use strict';

const program = require('commander');
const microApp = require('@micro-app/core');

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .parse(process.argv);

process.env.NODE_ENV = 'production';

global.extraArgs = program.args;

const type = program.type;
let wbpackAdapter = null;
switch (type) {
    case 'vusion':
        wbpackAdapter = new microApp.VusionAdapter();
        break;
    case 'vusioncore':
        wbpackAdapter = new microApp.VusionCoreAdapter();
        break;
    case 'webpack':
    default:
        wbpackAdapter = new microApp.WebpackAdapter();
        break;
}

wbpackAdapter.build().then(() => {
    console.info('>>> Build Success >>>');
}).catch(e => {
    console.error('>>> Build Error >>>', e);
});
