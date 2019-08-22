#!/usr/bin/env node
'use strict';

const program = require('commander');
const opn = require('opn');
const chalk = require('chalk').default;

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const microAppAdapter = require('@micro-app/plugin-adapter');

program
    .version(require('../package').version, '-v, --version')
    .option('-t, --type <type>', 'Choose a build type')
    .option('-H, --host <host>', 'Web url when open browser')
    .option('-p, --port <port>', 'Web Server Port', parseInt)
    .option('-o, --open-browser', 'Open browser when start server')
    .option('-n, --only-node', 'Only launch server')
    .parse(process.argv);

process.env.NODE_ENV = 'development';

global.extraArgs = program.args;

const type = program.type || 'webpack';
const wbpackAdapter = microAppAdapter(type);

const KoaAdapter = microAppAdapter('koa');
const koaAdapter = new KoaAdapter(wbpackAdapter, program);
koaAdapter.serve(url => {
    // success
    if (program.openBrowser) {
        opn(url);
    }

    logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
});
