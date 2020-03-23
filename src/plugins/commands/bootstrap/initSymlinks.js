'use strict';

const { _, fs, path } = require('@micro-app/shared-utils');
const symlink = require('../../../utils/symlink');

module.exports = function initSymlinks(api, { filteredPackages }) {

    // 初始化链接, 依赖 packages
    if (_.isEmpty(filteredPackages)) {
        api.logger.warn('[bootstrap]', 'Not has deps!');
        return Promise.resolve();
    }

    const tempDirPackageGraph = api.getTempDirPackageGraph();
    let names = filteredPackages.map(item => item.name);

    const dependencies = [];
    while (names && names.length) {
        const pkgs = tempDirPackageGraph.filters(names);
        dependencies.push(...names);
        const nexts = pkgs.reduce((arrs, item) => {
            const deps = item.dependencies || {};
            return arrs.concat(Object.keys(deps).filter(name => !!name));
        }, []);
        names = nexts.filter(item => !dependencies.includes(item));
    }

    const finallyDeps = tempDirPackageGraph.filters([].concat(dependencies));

    const dependencyLocation = api.nodeModulesPath;

    return Promise.all(finallyDeps.map(item => {
        return initSymlink(api, { item, dependencyLocation });
    }));
};


function initSymlink(api, { item, dependencyLocation }) {
    const dependencyName = item.name;
    const targetDirectory = path.join(dependencyLocation, dependencyName);

    let chain = Promise.resolve();

    // check if dependency is already installed
    chain = chain.then(() => fs.pathExists(targetDirectory));

    chain = chain.then(dirExists => {
        if (dirExists) {

            const isDepSymlink = symlink.resolve(targetDirectory);
            if (isDepSymlink !== false && isDepSymlink !== item.location) {
                // installed dependency is a symlink pointing to a different location
                api.logger.warn(
                    '[bootstrap]',
                    'EREPLACE_OTHER',
                    `Symlink already exists for ${dependencyName}, ` +
                'but links to different location. Replacing with updated symlink...'
                );
            } else if (isDepSymlink === false) {
                // installed dependency is not a symlink
                api.logger.warn(
                    '[bootstrap]',
                    'EREPLACE_EXIST',
                    `${dependencyName} is already installed.`
                );
                return true;
            }
        } else {
            // ensure destination directory exists (dealing with scoped subdirs)
            fs.ensureDir(path.dirname(targetDirectory));
        }
        return false;
    });

    chain = chain.then(isBreak => {
        if (!isBreak) {
            // create package symlink
            const orginalDirectory = item.location;
            api.logger.debug('[bootstrap > junction]', 'orginalDirectory: ', orginalDirectory);
            symlink.create(orginalDirectory, targetDirectory, 'junction');
        } else {
            api.logger.debug('[bootstrap > junction]', 'skip: ', dependencyName);
        }
    });

    // TODO: pass PackageGraphNodes directly instead of Packages
    // chain = chain.then(() => symlinkBinary(dependencyNode.pkg, currentNode.pkg));

    return chain;
}
