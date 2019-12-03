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

        chain = chain.then(() => this.initNodeModules({ scope }));

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
        const initTempDir = require('./initTempDir');

        const api = this.api;

        this.tempDir = initTempDir(api);
    }

    initNodeModules({ scope }) {
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

        api.logger.debug('pkgs', pkgs.length);

        // TODO 需要对外暴露筛选和修复名称, 或者使用其它安装 npm 方式。
        // 例如：
        const resultPkgs = [];
        pkgs.forEach(item => {
            if (scope) { // 是否指定 scope？
                resultPkgs.push(_.merge({}, item, {
                    name: `${scope}/${item.name}`,
                }));
            } else {
                if (!item.name.startsWith('@micro-app/')) {
                    const clone = _.cloneDeep(item);
                    clone.setName(`@micro-app/${item.name}`);
                    resultPkgs.push(clone);
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
        const path = require('path');
        const { _, fs } = require('@micro-app/shared-utils');

        // TODO 初始化链接, 依赖 packages
        const filteredPackages = this.filteredPackages;
        if (_.isEmpty(filteredPackages)) {
            return;
        }

        const api = this.api;

        const tempDirPackageGraph = api.tempDirPackageGraph;

        const pkgs = tempDirPackageGraph.addDependents(filteredPackages.map(item => ({ name: item.name })));
        console.warn(pkgs);
        const dependencies = pkgs.reduce((arrs, item) => {
            const deps = item.dependencies || {};
            return arrs.concat(Object.keys(deps).map(name => ({ name })));
        }, []);

        const finallyDeps = tempDirPackageGraph.addDependencies(pkgs.concat(dependencies));

        const symlink = require('../../../utils/symlink');
        const currentNodeModules = api.nodeModulesPath;

        return Promise.all(finallyDeps.map(item => {

            const dependencyName = item.name;
            const targetDirectory = path.join(currentNodeModules, dependencyName);

            let chain = Promise.resolve();

            // check if dependency is already installed
            chain = chain.then(() => fs.pathExists(targetDirectory));

            chain = chain.then(dirExists => {
                if (dirExists) {

                    const isDepSymlink = symlink.resolve(targetDirectory);
                    if (isDepSymlink !== false && isDepSymlink !== item.location) {
                        // installed dependency is a symlink pointing to a different location
                        api.logger.warn(
                            'EREPLACE_OTHER',
                            `Symlink already exists for ${dependencyName}, ` +
                    'but links to different location. Replacing with updated symlink...'
                        );
                    } else if (isDepSymlink === false) {
                        // installed dependency is not a symlink
                        api.logger.warn(
                            'EREPLACE_EXIST',
                            `${dependencyName} is already installed.`
                        );

                        // break;
                        return true;
                    }
                } else {
                // ensure destination directory exists (dealing with scoped subdirs)
                    fs.ensureDir(path.dirname(targetDirectory));
                    return false;
                }
            });

            chain = chain.then(isBreak => {
                if (!isBreak) {
                    // create package symlink
                    const dependencyLocation = item.contents
                        ? path.resolve(currentNodeModules, item.contents)
                        : currentNodeModules;

                    api.logger.debug('junction', 'dependencyLocation: ', dependencyLocation);
                    symlink.create(dependencyLocation, targetDirectory, 'junction');
                } else {
                    api.logger.debug('junction', 'break: ', dependencyName);
                }
            });

            // TODO: pass PackageGraphNodes directly instead of Packages
            // chain = chain.then(() => symlinkBinary(dependencyNode.pkg, currentNode.pkg));

            return chain;
        })).then(() => {
            api.logger.info('initSymlinks', 'finished');
        });
    }
}


module.exports = BootstrapCommand;
