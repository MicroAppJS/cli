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

let promise = Promise.resolve();
if (program.build) {
    const type = program.type;
    if (type === 'vusion') {
        const vusionAdapter = new microApp.VusionAdapter();
        promise = vusionAdapter.build().then(() => {
            return Promise.resolve(true);
        });
    } else {
        // webpack build ...
        const webpackAdapter = new microApp.WebpackAdapter();
        promise = webpackAdapter.build().then(() => {
            return Promise.resolve(true);
        });
    }
}

promise.then(flag => {
    if (flag) {
        logger.success('Build finish');
    }
    const wbpackAdapter = program.type === 'vusion' ? new microApp.VusionAdapter() : new microApp.WebpackAdapter();
    const koaAdapter = new microApp.KoaAdapter(wbpackAdapter, program);
    koaAdapter.start(url => {
        // success
        logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
    });
}).catch(e => {
    logger.error(e);
});
