'use strict';

const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const microApp = require('@micro-app/core');
const chalk = require('chalk').default;
const logger = microApp.logger;

module.exports = isHook => {
    const microAppConfig = microApp.self();
    if (!microAppConfig) return;

    const deployCfg = microAppConfig.config.deploy;
    if (!deployCfg || typeof deployCfg !== 'object') {
        logger.logo(`${chalk.yellow('need "deploy: \{\}" in "micro-app.config.js"')}`);
        return;
    }

    const gitURL = deployCfg.git || '';
    if (!gitURL || typeof gitURL !== 'string') {
        logger.logo(`${chalk.yellow('need "deploy.git: \'ssh://...\'" in "micro-app.config.js"')}`);
        return;
    }
    const gitPath = gitURL.replace(/^git\+/ig, '').split('#')[0];
    let gitBranch = deployCfg.branch || gitURL.split('#')[1] || 'master';
    const currBranch = ((shelljs.exec('git rev-parse --abbrev-ref HEAD', { silent: true }) || {}).stdout || '').trim();
    if (typeof gitBranch === 'object') {
        // 继承当前分支
        if (currBranch && gitBranch.extends === true) {
            gitBranch = currBranch;
        } else if (gitBranch.name) {
            gitBranch = gitBranch.name;
        } else {
            gitBranch = 'master';
        }
    }
    let gitMessage = deployCfg.message && ` | ${deployCfg.message}` || '';

    const gitUser = deployCfg.user || {};
    if (!gitUser.name || typeof gitUser.name !== 'string') {
        gitUser.name = ((shelljs.exec('git config user.name', { silent: true }) || {}).stdout || '').trim();
    }
    if (!gitUser.email || typeof gitUser.email !== 'string') {
        gitUser.email = ((shelljs.exec('git config user.email', { silent: true }) || {}).stdout || '').trim();
    }

    let commitHash = '';
    if (isHook) {
        commitHash = ((shelljs.exec('git rev-parse --verify HEAD', { silent: true }) || {}).stdout || '').trim();
    } else {
        commitHash = ((shelljs.exec(`git rev-parse origin/${currBranch}`, { silent: true }) || {}).stdout || '').trim();
    }

    if (!commitHash || typeof commitHash !== 'string') {
        logger.logo(`${chalk.yellow('Not Found commit Hash!')}`);
        return;
    }

    if (!gitMessage) {
        const msg = ((shelljs.exec(`git log --pretty=format:“%s” ${commitHash} -1`, { silent: true }) || {}).stdout || '').trim();
        if (msg) {
            gitMessage = ` | ${msg}`;
        }
    }

    const gitRoot = path.resolve(microAppConfig.root, '.git');
    if (fs.statSync(gitRoot).isDirectory()) {
        const deployDir = path.resolve(gitRoot, 'micro-deploy');
        if (fs.existsSync(deployDir)) {
            shelljs.rm('-rf', deployDir);
        }
        fs.mkdirSync(deployDir);
        if (fs.statSync(deployDir).isDirectory()) {
            const execStr = `git clone "${gitPath}" -b ${gitBranch} "${deployDir}"`;
            logger.logo(`Deploy: ${chalk.blueBright(gitPath)}`);
            logger.logo(`Branch: ${chalk.blueBright(gitBranch)}`);
            logger.logo(`Hash: ${chalk.blueBright(commitHash)}`);
            logger.logo(`Name: ${chalk.blueBright(gitUser.name)}`);
            logger.logo(`Email: ${chalk.blueBright(gitUser.email)}`);
            const result = shelljs.exec(execStr, { silent: true });
            if (result.code) {
                logger.logo(`${result.code}: ${chalk.yellow(result.stderr.trim().split('\n').reverse()[0])}`);
            } else {
                const pkg = require(path.resolve(deployDir, 'package.json')) || {};
                const { dependencies = {}, devDependencies = {} } = pkg;
                const deps = Object.assign({}, dependencies, devDependencies);

                const MICRO_APP_CONFIG_NAME = microAppConfig.packageName;
                if (deps[MICRO_APP_CONFIG_NAME]) {
                    const gitp = deps[MICRO_APP_CONFIG_NAME];
                    // update
                    const ngitp = gitp.replace(/#[-_\d\w]+$/igm, `#${commitHash}`);

                    if (gitp === ngitp) {
                        // not change
                        shelljs.rm('-rf', deployDir);
                        logger.logo(chalk.yellow('NOT MODIFIED!'));
                        return;
                    }
                    if (ngitp) {
                        if (dependencies[MICRO_APP_CONFIG_NAME]) {
                            dependencies[MICRO_APP_CONFIG_NAME] = ngitp;
                        }
                        if (devDependencies[MICRO_APP_CONFIG_NAME]) {
                            devDependencies[MICRO_APP_CONFIG_NAME] = ngitp;
                        }
                        fs.writeFileSync(path.resolve(deployDir, 'package.json'), JSON.stringify(pkg, null, 4), 'utf8');

                        // git config
                        if (gitUser.name && typeof gitUser.name === 'string') {
                            shelljs.exec(`git config user.name ${gitUser.name}`, { silent: true, cwd: deployDir });
                        }
                        if (gitUser.email && typeof gitUser.email === 'string') {
                            shelljs.exec(`git config user.email ${gitUser.email}`, { silent: true, cwd: deployDir });
                        }
                        // commit + push
                        const { code } = shelljs.exec(`git commit -a -m ":package: auto deploy ${MICRO_APP_CONFIG_NAME} - ${currBranch} - ${commitHash.substr(0, 8)}${gitMessage}"`, { cwd: deployDir });
                        if (code === 0) {
                            const { code } = shelljs.exec('git push', { cwd: deployDir });
                            if (code === 0) {
                                shelljs.rm('-rf', deployDir);
                                logger.logo(chalk.green('success'));
                                return;
                            }
                        }
                    }
                }
            }
        }

        if (fs.existsSync(deployDir)) {
            shelljs.rm('-rf', deployDir);
        }
        logger.logo(chalk.redBright('Fail! Check your config, please'));
    } else {
        logger.logo(`${chalk.yellow('not found git')}`);
    }
};
