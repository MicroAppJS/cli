'use strict';

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
        const { scope = false, force = false } = args;
        const api = this.api;

        let chain = Promise.resolve();

        chain = chain.then(() => api.applyPluginHooks('beforeCommandBootstrap', { args, options: this.options }));

        chain = chain.then(() => this.initPackages({ scope }));

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

        chain = chain.then(() => this.initTempFiles());

        chain = chain.then(() => this.progress(true));

        // 判断 node_modules 是否存在
        chain = chain.then(() => this.initNodeModules({ force }));

        chain = chain.then(() => this.bootstrap({ force }));

        chain = chain.then(() => this.initSymlinks());

        chain = chain.then(() => this.progress(false));

        chain = chain.then(() => api.applyPluginHooks('afterCommandBootstrap', { args, options: this.options }));

        return chain;
    }

    initPackages({ scope }) {
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

        const resultPkgs = [];
        pkgs.forEach(item => {
            if (scope) { // 是否指定 scope？
                resultPkgs.push(_.merge({}, item, {
                    name: `${scope}/${item.name}`,
                }));
            } else {
                resultPkgs.push(item);
            }
        });

        this.filteredPackages = resultPkgs;
    }

    initTempFiles() {
        const initTempDir = require('./initTempDir');

        const api = this.api;

        this.tempDir = initTempDir(api);
    }

    progress(flag) {
        const { logger } = require('@micro-app/shared-utils');
        if (flag) {
            logger.enableProgress();
        } else {
            logger.disableProgress();
        }
    }

    initNodeModules() {
        const { fs } = require('@micro-app/shared-utils');
        const npmInstall = require('./npmInstall');
        const api = this.api;
        const currentNodeModules = api.nodeModulesPath;
        if (fs.pathExistsSync(currentNodeModules)) {
            api.logger.warn('bootstrap', 'skip install!');
            return;
        }
        const root = api.root;
        return npmInstall(root, this.npmConfig);
    }

    bootstrap({ force }) {
        const { fs } = require('@micro-app/shared-utils');
        const npmInstall = require('./npmInstall');
        const api = this.api;
        if (fs.pathExistsSync(this.tempDir) && fs.readdirSync(this.tempDir).length > 0 && !force) {
            api.logger.warn('bootstrap', `${this.tempDir} is not empty!`);
            return;
        }
        const selfConfig = api.selfConfig;
        return npmInstall.micros(selfConfig.manifest, this.filteredPackages, this.tempDir, this.npmConfig);
        // return npmInstall.dependencies(selfConfig.manifest, this.filteredPackages, this.npmConfig);
    }

    initSymlinks() {
        const path = require('path');
        const { _, fs } = require('@micro-app/shared-utils');

        // 初始化链接, 依赖 packages
        const filteredPackages = this.filteredPackages;
        if (_.isEmpty(filteredPackages)) {
            return;
        }

        const api = this.api;
        const tempDirPackageGraph = api.tempDirPackageGraph;

        const pkgs = tempDirPackageGraph.addDependents(filteredPackages.map(item => ({ name: item.name })));
        // console.warn(pkgs);
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
                    api.logger.debug('junction', 'skip: ', dependencyName);
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
