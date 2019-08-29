'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const CONSTANTS = microApp.CONSTANTS;
const tryRequire = require('try-require');
const path = require('path');

module.exports = function(wConfig) {

    let buildCompiler = tryRequire('vusion-cli/lib/build');
    if (!buildCompiler) {
        buildCompiler = tryRequire(path.join(CONSTANTS.ROOT, 'node_modules', 'vusion-cli/lib/build'));
        if (!buildCompiler) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }
    const webpackConfig = buildCompiler.prepare(wConfig);

    return { webpackConfig };
};
