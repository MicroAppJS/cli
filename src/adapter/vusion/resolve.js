'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const tryRequire = require('try-require');
const path = require('path');

function resolveDefaultConfig(defaultVusionConfig = {}) {
    const modulePath = 'vusion-cli/config/defaults';
    let defaultConfigModule = tryRequire(modulePath);
    if (!defaultConfigModule) {
        defaultConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', modulePath));
        if (!defaultConfigModule) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }
    return Object.assign(defaultConfigModule, defaultVusionConfig);
}

module.exports = function resolveVusionConfig(defaultVusionConfig) {
    const { needLoadFile } = defaultVusionConfig;
    resolveDefaultConfig(defaultVusionConfig);

    const modulePath = 'vusion-cli/config/resolve';
    let vusionConfigModule = tryRequire(modulePath);
    if (!vusionConfigModule) {
        vusionConfigModule = tryRequire(path.join(process.cwd(), 'node_modules', modulePath));
        if (!vusionConfigModule) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }
    if (typeof vusionConfigModule === 'function') {
        const funcParams = vusionConfigModule.prototype.constructor.toString()
            .replace(/[\w\s]*\(/ig, '').replace(/\)[\w\s\S]*/ig, '')
            .trim()
            .split(',')
            .map(item => item.trim());
        const num = funcParams.indexOf('externalConfig');
        if (num > 0) {
            const externalConfigs = [ ];
            for (let i = 1; i < num; i++) {
                externalConfigs.push(undefined);
            }
            externalConfigs.push(defaultVusionConfig);
            // 继续优化可省略 vusion.config.js
            let filename = 'vusion.config.js';
            if (!needLoadFile) {
                filename = path.resolve(__dirname, 'vusion.config.js');
            }
            return vusionConfigModule(filename, ...externalConfigs);
        }
        return vusionConfigModule();
    }
    return {};
};
