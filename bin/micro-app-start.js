#!/usr/bin/env node
'use strict';

const program = require('commander');
const chalk = require('chalk').default;

const microApp = require('@micro-app/core');
const logger = microApp.logger;

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .option('-B, --build', 'Build files in the beginning')
    .option('-p, --port <port>', 'Web Server Port', parseInt)
    .parse(process.argv);

process.env.NODE_ENV = 'production';

global.extraArgs = program.args;


// const wbpackAdapter = program.type === 'vusion' ? new microApp.VusionAdapter() : new microApp.WebpackAdapter();
let wbpackAdapter = null;
switch (program.type) {
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

let promise = Promise.resolve();
if (program.build) {
    promise = wbpackAdapter.build().then(() => {
        return Promise.resolve(true);
    });
}

promise.then(flag => {
    if (flag) {
        logger.success('Build finish');
    }
    const koaAdapter = new microApp.KoaAdapter(wbpackAdapter, program);
    koaAdapter.start(url => {
        // success
        logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
    });
}).catch(e => {
    logger.error(e);
});
