#!/usr/bin/env node
'use strict';

const program = require('commander');
const shelljs = require('shelljs');
const chalk = require('chalk').default;

const microApp = require('@micro-app/core');
const CONSTANT = microApp.CONSTANT;
const logger = microApp.logger;

const path = require('path');

program
    .version(require('../package').version, '-v, --version')
    .option('init', 'Init a config file')
    .option('-l, --list', 'Show micros list')
    .option('-s, --show <show>', 'Show alias & shared list')
    .option('-u, --update <update>', 'Update moicros')
    .parse(process.argv);

global.extraArgs = program.args;

if (program.init) {
    const mainPath = require.resolve('@micro-app/core');
    const configPath = path.resolve(mainPath, '../../', microApp.CONSTANT.CONFIG_NAME);
    const dest = path.resolve(process.cwd(), microApp.CONSTANT.CONFIG_NAME);
    shelljs.cp('-R', configPath, dest);

    logger.success(`Init Fnished, Create: ${chalk.yellow(microApp.CONSTANT.CONFIG_NAME)}`);
}

if (program.list) {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;

    logger.logo(`${chalk.green('Micros List')}:`);
    if (micros.length) {
        micros.forEach(item => {
            logger.logo(`   * ${chalk.yellow(item)} --- ${chalk.gray(CONSTANT.SCOPE_NAME + '/' + item)}`);
        });
    } else {
        logger.logo(' [ null ] ');
    }
}

if (program.show) {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;
    switch (program.show) {
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
}

if (program.update) {
    // shelljs.exec('')
    logger.logo(' Not Support! ');
}
