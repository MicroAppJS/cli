#!/usr/bin/env node
'use strict';

const program = require('commander');
const chalk = require('chalk').default;

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const microAppAdapter = require('@micro-app/plugin-adapter');

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .option('-B, --build', 'Build files in the beginning')
    .option('-p, --port <port>', 'Web Server Port', parseInt)
    .parse(process.argv);

process.env.NODE_ENV = 'production';

global.extraArgs = program.args;

const type = program.type || 'webpack';
const wbpackAdapter = microAppAdapter(type);

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
    const KoaAdapter = microAppAdapter('koa');
    const koaAdapter = new KoaAdapter(wbpackAdapter, program);
    koaAdapter.start(url => {
        // success
        logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
    });
}).catch(e => {
    logger.error(e);
});
