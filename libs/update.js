'use strict';

const shelljs = require('shelljs');
const chalk = require('chalk').default;
const microApp = require('@micro-app/core');
const logger = microApp.logger;

const path = require('path');

module.exports = name => {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;
    const micros = microAppConfig.micros;
    if (micros.includes(name)) {
        const microConfig = microApp(name);
        if (microConfig) {
            const root = microConfig.root;
            if (!root.startsWith(microAppConfig.nodeModules)) {
                // 丢弃软链接
                return;
            }

            const pkgInfo = microAppConfig.package;
            const gitPath = (pkgInfo.devDependencies && pkgInfo.devDependencies[microConfig.packageName]) || (pkgInfo.dependencies && pkgInfo.dependencies[microConfig.packageName]) || false;
            if (gitPath) {
                logger.logo(`${chalk.yellow('Delete')}: ${root}`);
                shelljs.rm('-rf', root);
                shelljs.rm('-rf', path.join(microAppConfig.root, 'package-lock.json'));
                logger.logo('waiting...');
                shelljs.exec(`npm install -D "${gitPath}"`);
                logger.logo(`${chalk.green('Finish!')}`);
                return;
            }
        }
    } else if (name === 'all' || name === '*') {
        shelljs.rm('-rf', path.join(microAppConfig.root, 'package-lock.json'));
        micros.map(key => {
            const microConfig = microApp(key);
            if (microConfig) {
                const root = microConfig.root;
                if (!root.startsWith(microAppConfig.nodeModules)) {
                    // 丢弃软链接
                    return false;
                }

                const pkgInfo = microAppConfig.package;
                const gitPath = (pkgInfo.devDependencies && pkgInfo.devDependencies[microConfig.packageName]) || (pkgInfo.dependencies && pkgInfo.dependencies[microConfig.packageName]) || false;
                if (gitPath) {
                    return {
                        root, gitPath,
                    };
                }
            }
            return false;
        }).filter(item => !!item).map(({ root, gitPath }) => {
            logger.logo(`${chalk.yellow('Delete')}: ${root}`);
            shelljs.rm('-rf', root);
            return gitPath;
        });

        logger.logo('waiting...');
        shelljs.exec('npm install');

        logger.logo(`${chalk.green('Finish!')}`);
        return;
    }
    logger.error('Update Error!!!');
};
