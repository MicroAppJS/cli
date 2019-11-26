'use strict';

const { Command } = require('@micro-app/core');

class BootstrapCommand extends Command {

    initialize(api) {
        const { chalk, dedent } = require('@micro-app/shared-utils');

        api.registerMethod('beforeCommandBootstrap', {
            type: api.API_TYPE.EVENT,
            description: '初始化前事件',
        });
        api.registerMethod('afterCommandBootstrap', {
            type: api.API_TYPE.EVENT,
            description: '初始化完毕后事件',
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
        const { scope = false } = args;

        let chain = Promise.resolve();

        // TODO 判断 node_modules 是否存在

        chain = chain.then(() => this.initTempFiles());

        chain = chain.then(() => this.initGits({ scope }));

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

        chain = chain.then(() => this.progress(true));

        chain = chain.then(() => this.bootstrap());

        chain = chain.then(() => this.initSymlinks());

        chain = chain.then(() => this.progress(false));

        return chain;
    }

    progress(flag) {
        const { logger } = require('@micro-app/shared-utils');
        if (flag) {
            logger.enableProgress();
        } else {
            logger.disableProgress();
        }
    }

    initTempFiles() {
        const path = require('path');
        const { fs, _ } = require('@micro-app/shared-utils');

        const api = this.api;
        const allPackages = api.packages;

        if (_.isEmpty(allPackages)) {
            return;
        }

        // TODO 初始化临时文件
        const scope = api.tempDirName;
        if (_.isString(scope)) {
            const tempDir = path.resolve(api.root, scope);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirpSync(tempDir);
                api.logger.debug('create scope', tempDir);
            }
            if (!this.tempDir) {
                this.tempDir = tempDir;
            }
        }

        api.logger.debug('[bootstrap]', `tempDir: ${this.tempDir}`);
    }

    initGits({ scope }) {
        const { _ } = require('@micro-app/shared-utils');

        const api = this.api;
        const allPackages = api.packages;

        if (_.isEmpty(allPackages)) {
            return;
        }

        // init git
        const pkgs = allPackages.filter(item => {
            return item.type === 'git';
        }).map(item => {
            return item.pkgInfo;
        });

        // TODO 需要对外暴露筛选和修复名称, 或者使用其它安装 npm 方式。
        // 例如：
        const resultPkgs = [];
        pkgs.forEach(item => {
            if (scope) {
                resultPkgs.push(_.merge({}, item, {
                    name: `${scope}/${item.name}`,
                }));
            } else {
                if (!item.name.startsWith('@micro-app/')) {
                    resultPkgs.push(_.merge({}, item, {
                        name: `@micro-app/${item.name}`,
                    }));
                }
                resultPkgs.push(item);
            }
        });

        this.filteredPackages = resultPkgs;
    }

    bootstrap() {
        const { fs } = require('@micro-app/shared-utils');
        const npmInstall = require('./npmInstall');
        const api = this.api;
        const selfConfig = api.selfConfig;
        if (fs.readdirSync(this.tempDir).length > 0) {
            api.logger.warn('bootstrap', `${this.tempDir} is not empty!`);
            return;
        }
        return npmInstall.micros(selfConfig.manifest, this.filteredPackages, this.tempDir, this.npmConfig);
        // return npmInstall.dependencies(selfConfig.manifest, this.filteredPackages, this.npmConfig);
    }

    initSymlinks() {
        const { _ } = require('@micro-app/shared-utils');
        // TODO 初始化链接, 依赖 packages
        const api = this.api;
        const allPackages = api.packages;

        if (_.isEmpty(allPackages)) {
            return;
        }
        const tempDirPackageGraph = api.tempDirPackageGraph;

        api.logger.debug('ccc...');
        const deps = api.micros.map(key => {
            if (/^@micro-app/.test(key)) {
                if (tempDirPackageGraph.has(key)) {
                    return { name: key };
                }
                return null;
            }
            if (tempDirPackageGraph.has(key)) {
                return { name: key };
            }
            if (tempDirPackageGraph.has(`@micro-app/${key}`)) {
                return { name: `@micro-app/${key}` };
            }
            return null;
        });
        const dependencies = api.tempDirPackageGraph.addDependencies(deps);
        console.warn(dependencies);
        dependencies.reduce((arrs, item) => {
            console.warn(item.localDependencies);
            return arrs;
        }, []);
    }
}


module.exports = BootstrapCommand;
