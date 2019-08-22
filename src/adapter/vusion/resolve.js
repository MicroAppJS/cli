'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const tryRequire = require('try-require');
const path = require('path');

module.exports = function resolveVusionConfig(webpackConfig = {}) {
    const modulePath = 'vusion-cli/config/resolve';
    let vusionConfigModule = tryRequire(modulePath);
    if (!vusionConfigModule) {
        vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', modulePath));
        if (!vusionConfigModule) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }
    return typeof vusionConfigModule === 'function' ? vusionConfigModule('vusion.config.js', webpackConfig) : {};
};
