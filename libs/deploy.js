'use strict';

const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const microApp = require('@micro-app/core');
const chalk = require('chalk').default;
const logger = microApp.logger;

module.exports = () => {
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
    const gitBranch = deployCfg.branch || gitURL.split('#')[1] || 'master';

    const commitHash = ((shelljs.exec('git rev-parse --verify HEAD', { silent: true }) || {}).stdout || '').trim();

    const gitRoot = path.resolve(microAppConfig.root, '.gittest');
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
            const result = shelljs.exec(execStr, { silent: true });
            if (result.code) {
                logger.logo(`${result.code}: ${chalk.yellow(result.stderr.trim().split('\n').reverse()[0])}`);
            } else {
                const pkg = require(path.resolve(deployDir, 'package.json')) || {};
                const { dependencies = {}, devDependencies = {} } = pkg;
                const deps = Object.assign({}, dependencies, devDependencies);

                const MICRO_APP_CONFIG_NAME = microAppConfig.name;
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

                        // commit + push
                        const { code } = shelljs.exec(`git commit -a -m "auto deploy ${MICRO_APP_CONFIG_NAME}"`, { cwd: deployDir });
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
