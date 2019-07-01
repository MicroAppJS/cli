#!/usr/bin/env node
'use strict';

const program = require('commander');
const opn = require('opn');
const chalk = require('chalk').default;

const microApp = require('@micro-app/core');
const logger = microApp.logger;

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

const wbpackAdapter = program.type === 'vusion' ? new microApp.VusionAdapter() : new microApp.WebpackAdapter();
const koaAdapter = new microApp.KoaAdapter(wbpackAdapter, program);
koaAdapter.devHot(url => {
    // success
    if (program.openBrowser) {
        opn(url);
    }

    logger.info(`Open Browser, URL: ${chalk.yellow(url)}`);
});
