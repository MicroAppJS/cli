'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const tryRequire = require('try-require');
const path = require('path');

module.exports = function(webpackConfig) {
    let devCompiler = tryRequire('vusion-cli/lib/dev');
    if (!devCompiler) {
        devCompiler = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/lib/dev'));
        if (!devCompiler) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }

    const { compiler, devOptions } = devCompiler.prepare(webpackConfig);
    return { webpackConfig, compiler, devOptions };
};
