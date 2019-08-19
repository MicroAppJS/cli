'use strict';

const chalk = require('chalk').default;
const microApp = require('@micro-app/core');
const logger = microApp.logger;

function showLoggerList(microConfig, type) {
    const aliasName = microConfig.name;
    if (aliasName) {
        const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
        Object.keys(microConfig[type]).forEach(key => {
            if (microConfig[type][key]) {
                const currAlias = microConfig.config.alias || {};
                const desc = currAlias[key] && currAlias[key].description || false;
                const textStrs = [ `   * ${chalk.yellow(`${aliasKey}/${key}`)}` ];
                if (desc && typeof desc === 'string') {
                    textStrs.push(`(${chalk.gray(desc)})`);
                }
                logger.logo(textStrs.join(' '));
            }
        });
    }
}

module.exports = name => {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;
    switch (name) {
        case 'alias':
            logger.logo(`${chalk.green('Alias List')}:`);
            micros.forEach(item => {
                const microConfig = microApp(item);
                if (microConfig) {
                    showLoggerList(microConfig, 'alias');
                }
            });
            // self
            showLoggerList(microAppConfig, 'alias');
            break;
        case 'share':
        case 'shared':
            logger.logo(`${chalk.green('Shared List')}:`);
            micros.forEach(item => {
                const microConfig = microApp(item);
                if (microConfig) {
                    showLoggerList(microConfig, 'shared');
                }
            });
            // self
            showLoggerList(microAppConfig, 'shared');
            break;
        default:
            logger.logo(`${chalk.green('Show Details')}:`);
            logger.logo(JSON.stringify(microAppConfig.toJSON(), null, 4));
            break;
    }
};
