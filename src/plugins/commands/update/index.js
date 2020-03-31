'use strict';

// TODO 待重构优化

const shelljs = require('shelljs');
const path = require('path');
const chalk = require('chalk');

module.exports = function updateCommand(api, opts) {

    const registerMethods = require('./methods');
    registerMethods(api);

    // start
    api.registerCommand('update', {
        description: 'update package.json',
        usage: 'micro-app update [options]',
        options: {
            '-': 'update all.',
            '--name <name>': 'only update <name>.',
        },
        details: `
Examples:
    ${chalk.gray('# update all')}
    micro-app update
    ${chalk.gray('# only update <name>')}
    micro-app update -n <name>
        `.trim(),
    }, args => {
        const name = args.name;
        return updateMicro(api, name);
    });
};

function updateMicro(api, name) {
    const logger = api.logger;
    const microAppConfig = api.selfConfig;
    const micros = api.micros;
    const microsConfig = api.microsConfig;
    const currentNodeModulesPath = microAppConfig.nodeModulesPath;
    const currentPkgInfo = microAppConfig.package;

    const options = {
        name, micros,
    };
    api.applyPluginHooks('beforeCommandUpdate', options);
    const _name = options.name;
    const _micros = options.micros;

    if (_micros.includes(_name)) {
        const microConfig = microsConfig[_name];
        if (microConfig) {
            const root = microConfig.originalRoot || microConfig.root;
            if (root.startsWith(currentNodeModulesPath)) { // 丢弃非 node_modules 中的地址
                const gitPath = (currentPkgInfo.devDependencies && currentPkgInfo.devDependencies[microConfig.packageName]) || (currentPkgInfo.dependencies && currentPkgInfo.dependencies[microConfig.packageName]) || false;
                if (gitPath) {
                    logger.logo(`${chalk.yellow('Delete')}: ${root}`);
                    shelljs.rm('-rf', root);
                    shelljs.rm('-rf', path.join(microAppConfig.root, 'package-lock.json'));
                    const spinner = logger.spinner(`Updating ${_name} ...`);
                    spinner.start();
                    shelljs.exec(`npm install -D "${gitPath}"`);
                    spinner.succeed(`${chalk.green('Update Finish!')}`);
                }
            }
        }
    } else if (!_name) { // all
        const gitPaths = _micros.map(key => {
            const microConfig = microsConfig[key];
            if (microConfig) {
                const root = microConfig.root;
                if (!root.startsWith(currentNodeModulesPath)) {
                    // 丢弃软链接
                    return false;
                }

                const gitPath = (currentPkgInfo.devDependencies && currentPkgInfo.devDependencies[microConfig.packageName]) || (currentPkgInfo.dependencies && currentPkgInfo.dependencies[microConfig.packageName]) || false;
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

        if (gitPaths.length) {
            shelljs.rm('-rf', path.join(microAppConfig.root, 'package-lock.json'));
            const spinner = logger.spinner('Updating all ...');
            spinner.start();
            shelljs.exec('npm install');
            spinner.succeed(`${chalk.green('Update Finish!')}`);
        }

        logger.logo(`${chalk.green('Finish!')}`);
    } else {
        logger.error('[update]', `Not Found micros: "${_name}"`);
    }

    api.applyPluginHooks('afterCommandUpdate', options);
}

module.exports.configuration = {
    description: '强制更新 micros 依赖服务命令行',
};
