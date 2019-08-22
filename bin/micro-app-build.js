#!/usr/bin/env node
'use strict';

const program = require('commander');
const microApp = require('@micro-app/core');
const logger = microApp.logger;
const microAppAdapter = require('@micro-app/plugin-adapter');

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .parse(process.argv);

process.env.NODE_ENV = 'production';

global.extraArgs = program.args;

const type = program.type || 'webpack';
const wbpackAdapter = microAppAdapter(type);

wbpackAdapter.build().then(() => {
    logger.success('>>> Build Success >>>');
}).catch(e => {
    logger.error('>>> Build Error >>>', e);
});
