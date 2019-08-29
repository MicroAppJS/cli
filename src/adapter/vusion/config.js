'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const CONSTANTS = microApp.CONSTANTS;
const tryRequire = require('try-require');
const path = require('path');

module.exports = function(vusionConfig) {
    let webpackConfig = tryRequire('vusion-cli/webpack/' + vusionConfig.type);
    if (!webpackConfig) {
        webpackConfig = tryRequire(path.join(CONSTANTS.ROOT, 'node_modules', 'vusion-cli/webpack/' + vusionConfig.type));
        if (!webpackConfig) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }

    return webpackConfig;
};
