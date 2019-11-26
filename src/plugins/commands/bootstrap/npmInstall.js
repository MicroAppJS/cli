'use strict';

const { fs, logger } = require('@micro-app/shared-utils');
const onExit = require('signal-exit');
const path = require('path');
const execa = require('execa');

function getExecOpts(location, registry) {
// execa automatically extends process.env
    const env = {};

    if (registry) {
        env.npm_config_registry = registry;
    }

    return {
        cwd: location,
        env,
        // location,
    };
}

module.exports = npmInstall;
module.exports.dependencies = npmInstallDependencies;
module.exports.micros = npmInstallMicros;

function npmInstall(
    location,
    { registry, npmClient, npmClientArgs, npmGlobalStyle, stdio = 'inherit', subCommand = 'install' }
) {
    // build command, arguments, and options
    const opts = getExecOpts(location, registry);
    const args = [ subCommand ];
    let cmd = npmClient || 'npm';

    if (npmGlobalStyle) {
        cmd = 'npm';
        args.push('--global-style');
    }

    if (cmd === 'yarn') {
        args.push('--non-interactive');
    }

    if (npmClientArgs && npmClientArgs.length) {
        args.push(...npmClientArgs);
    }

    // potential override, e.g. "inherit" in root-only bootstrap
    opts.stdio = stdio;

    // provide env sentinels to avoid recursive execution from scripts
    opts.env.MICRO_APP_EXEC_PATH = location;

    logger.debug('npmInstall', [ cmd, args, opts ]);
    return execa(cmd, args, opts);
}

// new
function npmInstallMicros(pkg, dependencies, tempDir, config) {
    logger.debug('npmInstallMicros', pkg.name, dependencies);

    // Nothing to do if we weren't given any deps.
    if (!(dependencies && dependencies.length)) {
        logger.verbose('npmInstallMicros', 'no dependencies to install');

        return Promise.resolve();
    }

    const tempManifestLocation = path.resolve(tempDir, 'package.json');
    logger.debug('npmInstallMicros', 'tempManifestLocation', tempManifestLocation);

    const cleanup = () => {
        logger.debug('npmInstallMicros', 'cleanup', tempManifestLocation);
        // Need to do this one synchronously because we might be doing it on exit.
        fs.removeSync(tempManifestLocation);
    };
    const exceptionEvent = () => {
        logger.debug('npmInstallMicros', 'cleanup', tempDir);
        fs.removeSync(path.resolve(tempDir, 'node_modules'));
        if (fs.readdirSync(tempDir).length <= 0) {
            fs.removeSync(tempDir);
        }
    };

    // If we die we need to be sure to put things back the way we found them.
    const unregister = onExit(() => {
        cleanup();
        exceptionEvent();
    });

    // We have a few housekeeping tasks to take care of whether we succeed or fail.
    const done = finalError => {
        cleanup();
        unregister();

        if (finalError) {
            exceptionEvent();
            logger.throw('npmInstallMicros', finalError);
        }
    };

    // mutate a clone of the manifest with our new versions
    const tempJson = transformManifest(pkg, dependencies);

    logger.debug('npmInstallMicros', tempJson);

    // Write out our temporary cooked up package.json and then install.
    return fs.writeJSON(tempManifestLocation, tempJson)
        .then(() => npmInstall(tempDir, config))
        .then(() => done(), done);
}

function npmInstallDependencies(pkg, dependencies, config) {
    logger.debug('npmInstallDependencies', pkg.name, dependencies);

    // Nothing to do if we weren't given any deps.
    if (!(dependencies && dependencies.length)) {
        logger.verbose('npmInstallDependencies', 'no dependencies to install');

        return Promise.resolve();
    }

    const packageJsonBkp = `${pkg.manifestLocation}.microapp_backup`;

    logger.debug('npmInstallDependencies', 'backup', pkg.manifestLocation);

    return fs.rename(pkg.manifestLocation, packageJsonBkp).then(() => {
        const cleanup = () => {
            logger.debug('npmInstallDependencies', 'cleanup', pkg.manifestLocation);
            // Need to do this one synchronously because we might be doing it on exit.
            fs.renameSync(packageJsonBkp, pkg.manifestLocation);
        };

        // If we die we need to be sure to put things back the way we found them.
        const unregister = onExit(cleanup);

        // We have a few housekeeping tasks to take care of whether we succeed or fail.
        const done = finalError => {
            cleanup();
            unregister();

            if (finalError) {
                throw finalError;
            }
        };

        // mutate a clone of the manifest with our new versions
        const tempJson = transformManifest(pkg, dependencies);

        // Write out our temporary cooked up package.json and then install.
        return fs.writeJSON(pkg.manifestLocation, tempJson)
            .then(() => npmInstall(pkg.location, config))
            .then(() => done(), done);
    });
}

function transformManifest(pkg, dependencies) {
    const json = pkg.toJSON();

    // a map of depName => depVersion (resolved by npm-package-arg)
    const depMap = new Map(
        dependencies.map(dep => {
            const { name, rawSpec } = dep;
            return [ name, rawSpec || '*' ];
        })
    );

    // don't run lifecycle scripts
    delete json.scripts;

    // filter all types of dependencies
    [ 'dependencies', 'devDependencies', 'optionalDependencies' ].forEach(depType => {
        const collection = json[depType];

        if (collection) {
            Object.keys(collection).forEach(depName => {
                if (depMap.has(depName)) {
                    // overwrite version to ensure it's always present (and accurate)
                    collection[depName] = depMap.get(depName);

                    // only add to one collection, also keeps track of leftovers
                    depMap.delete(depName);
                } else {
                    // filter out localDependencies and _duplicate_ external deps
                    delete collection[depName];
                }
            });
        }
    });

    [ 'bundledDependencies', 'bundleDependencies' ].forEach(depType => {
        const collection = json[depType];
        if (collection) {
            const newCollection = [];
            for (const depName of collection) {
                if (depMap.has(depName)) {
                    newCollection.push(depName);
                    depMap.delete(depName);
                }
            }
            json[depType] = newCollection;
        }
    });

    // add all leftovers (root hoisted)
    if (depMap.size) {
        if (!json.dependencies) {
            // TODO: this should definitely be versioned, not blown away after install :/
            json.dependencies = {};
        }

        depMap.forEach((depVersion, depName) => {
            json.dependencies[depName] = depVersion;

            logger.debug('npmInstallDependencies', 'depName:', depVersion);
        });
    }

    return json;
}
