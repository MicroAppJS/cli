'use strict';

// TODO 需要整理目录结构，需要保留 package.json, 但是要更改内容

const { Command } = require('@micro-app/core');

class BootstrapCommand extends Command {

    initialize(api) {
        const { chalk, dedent } = require('@micro-app/shared-utils');

        api.registerMethod('beforeCommandBootstrap', {
            type: api.API_TYPE.EVENT,
            description: 'bootstrap 前事件',
        });
        api.registerMethod('afterCommandBootstrap', {
            type: api.API_TYPE.EVENT,
            description: 'bootstrap 完毕后事件',
        });

        // start
        api.registerCommand('bootstrap', {
            description: 'bootstrap micro app project.',
            usage: 'micro-app bootstrap [options]',
            options: {
                '-': 'bootstrap default.',
            // '-n <name>': 'only bootstrap <name>.',
            },
            details: dedent`
                Examples:
                    ${chalk.gray('# bootstrap')}
                    micro-app bootstrap`,
        }, this.execute.bind(this));
    }

    execute(args) {
        const { registry, npmClient = 'npm', npmClientArgs = [] } = this.options;
        const { force = false } = args;
        const api = this.api;

        const spinner = api.logger.spinner('bootstrap...');

        let chain = Promise.resolve();

        chain = chain.then(() => {
            spinner.start();
        });

        chain = chain.then(() => api.applyPluginHooks('beforeCommandBootstrap', { args, options: this.options }));

        chain = chain.then(() => {
            this.npmConfig = {
                registry,
                npmClient,
                npmClientArgs,
            };
        });

        chain = chain.then(() => {
            if (npmClient === 'yarn') {
                this.npmConfig.npmClientArgs.unshift('--pure-lockfile');
            } else {
                this.npmConfig.npmClientArgs.unshift('--no-save');
            }
        });

        chain = chain.then(() => this.initPackages());

        chain = chain.then(() => this.initTempFiles());

        // 判断 node_modules 是否存在
        chain = chain.then(() => this.initNodeModules({ force }));

        chain = chain.then(() => this.bootstrap({ force }));

        chain = chain.then(() => this.initSymlinks());

        chain = chain.then(() => api.applyPluginHooks('afterCommandBootstrap', { args, options: this.options }));

        return chain.then(() => {
            spinner.succeed('finished!');
        }).catch(e => {
            spinner.fail(e.message);
        });
    }

    initPackages() {
        const { _ } = require('@micro-app/shared-utils');

        const api = this.api;
        const allPackages = api.packages;

        if (_.isEmpty(allPackages)) {
            return;
        }

        // init git
        const pkgs = allPackages.filter(item => {
            return item.pkgInfo;
        }).map(item => {
            return item.pkgInfo;
        });

        api.logger.debug('[bootstrap > initPackages]', pkgs.length);
        this.filteredPackages = pkgs;
    }

    initTempFiles() {
        const initTempDir = require('./initTempDir');
        const api = this.api;
        this.tempDir = initTempDir(api);
    }

    initNodeModules() {
        const { fs } = require('@micro-app/shared-utils');
        const npmInstall = require('./npmInstall');
        const api = this.api;
        const currentNodeModules = api.nodeModulesPath;
        if (fs.pathExistsSync(currentNodeModules)) {
            api.logger.warn('[bootstrap]', 'skip root install!');
            return;
        }
        const root = api.root;
        return npmInstall(root, this.npmConfig);
    }

    bootstrap({ force }) {
        const { fs, path } = require('@micro-app/shared-utils');
        const npmInstall = require('./npmInstall');
        const api = this.api;
        if (!force) {
            if (fs.pathExistsSync(this.tempDir) && fs.pathExistsSync(path.join(this.tempDir, 'node_modles'))) {
                api.logger.warn('[bootstrap]', `${this.tempDir} is not empty!`);
                return;
            }
        }
        return npmInstall.micros(this.filteredPackages, this.tempDir, this.npmConfig);
    }

    initSymlinks() {
        const initSymlinks = require('./initSymlinks');
        const filteredPackages = this.filteredPackages;
        const api = this.api;

        return initSymlinks(api, { filteredPackages }).then(() => {
            api.logger.debug('[bootstrap > initSymlinks]', 'finished');
        });
    }
}


module.exports = BootstrapCommand;

module.exports.configuration = {
    description: '初始化命令行',
};
