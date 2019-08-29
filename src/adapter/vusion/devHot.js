'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const CONSTANTS = microApp.CONSTANTS;
const tryRequire = require('try-require');
const path = require('path');

module.exports = function(wConfig) {
    let devCompiler = tryRequire('vusion-cli/lib/dev');
    if (!devCompiler) {
        devCompiler = tryRequire(path.join(CONSTANTS.ROOT, 'node_modules', 'vusion-cli/lib/dev'));
        if (!devCompiler) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }

    const { compiler, devOptions, webpackConfig } = devCompiler.prepare(wConfig);
    if (!webpackConfig) {
        logger.error('请升级 vusion-cli 版本 > 0.7.17 !!!');
        process.exit(1);
    }
    return { webpackConfig, compiler, devOptions };
};
