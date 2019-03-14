'use strict';

const chalk = require('chalk').default;
const microApp = require('@necfe/micro-app-core');
const logger = microApp.logger;

module.exports = name => {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;
    switch (name) {
        case 'alias':
            {
                logger.logo(`${chalk.green('Alias List')}:`);
                micros.forEach(item => {
                    const microConfig = microApp(item);
                    if (microConfig) {
                        const aliasName = microConfig.name;
                        if (aliasName) {
                            const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
                            Object.keys(microConfig.alias).forEach(key => {
                                if (microConfig.alias[key]) {
                                    logger.logo(`   * ${chalk.yellow(`${aliasKey}/${key}`)}`);
                                }
                            });
                        }
                    }
                });
                // self
                const aliasName = microAppConfig.name;
                if (aliasName) {
                    const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
                    Object.keys(microAppConfig.alias).forEach(key => {
                        if (microAppConfig.alias[key]) {
                            logger.logo(`   * ${chalk.yellow(`${aliasKey}/${key}`)}`);
                        }
                    });
                }
            }
            break;
        case 'share':
        case 'shared':
            {
                logger.logo(`${chalk.green('Shared List')}:`);
                micros.forEach(item => {
                    const microConfig = microApp(item);
                    if (microConfig) {
                        const aliasName = microConfig.name;
                        if (aliasName) {
                            const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
                            Object.keys(microConfig.shared).forEach(key => {
                                if (microConfig.shared[key]) {
                                    logger.logo(`   * ${chalk.yellow(`${aliasKey}/${key}`)}`);
                                }
                            });
                        }
                    }
                });
                // self
                const aliasName = microAppConfig.name;
                if (aliasName) {
                    const aliasKey = aliasName[0] !== '@' ? `@${aliasName}` : aliasName;
                    Object.keys(microAppConfig.shared).forEach(key => {
                        if (microAppConfig.shared[key]) {
                            logger.logo(`   * ${chalk.yellow(`${aliasKey}/${key}`)}`);
                        }
                    });
                }
            }
            break;
        default:
            logger.logo(`${chalk.green('Show Details')}:`);
            logger.logo(JSON.stringify(microAppConfig.toJSON(), null, 4));
            break;
    }
};
