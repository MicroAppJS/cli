'use strict';

const { fs, logger, shell, onExit, path } = require('@micro-app/shared-utils');

module.exports = npmInstall;
module.exports.micros = npmInstallMicros;

function npmInstall(
    root,
    { npmClient, npmClientArgs, subCommand = 'install' }
) {
    // build command, arguments, and options
    const cmd = npmClient || 'npm';
    const args = [ subCommand ];

    if (cmd === 'yarn') {
        args.push('--non-interactive');
    }

    if (npmClientArgs && npmClientArgs.length) {
        args.push(...npmClientArgs);
    }

    const opts = {
        silent: false,
        stdin: 'inherit',
        cwd: root,
    };

    const _command = [].concat(cmd, args).join(' ');
    logger.debug('npmInstall', _command, opts);
    return shell.exec(_command, opts);
}

// new
function npmInstallMicros(packages, tempDir, config) {
    logger.debug('npmInstallMicros', packages);

    // Nothing to do if we weren't given any deps.
    if (!(packages && packages.length)) {
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
    };

    // If we die we need to be sure to put things back the way we found them.
    const unregister = onExit(() => {
        cleanup();
        exceptionEvent();
    });

    // We have a few housekeeping tasks to take care of whether we succeed or fail.
    const done = finalError => {
        unregister();

        if (finalError) {
            exceptionEvent();
            logger.throw('npmInstallMicros', finalError);
        }
    };

    // mutate a clone of the manifest with our new versions
    const tempJson = createManifest(packages);

    logger.debug('npmInstallMicros', tempJson);

    // Write out our temporary cooked up package.json and then install.
    return fs.writeJSON(tempManifestLocation, tempJson)
        .then(() => npmInstall(tempDir, config))
        .then(() => done(), done);
}

function createManifest(packages = []) {
    const json = {
        name: '@micro-app/temp',
        version: '0.0.1-beta',
        private: true,
        dependencies: packages.reduce((obj, pkg) => {
            const name = pkg.name;
            obj[name] = pkg.rawSpec || '*';
            return obj;
        }, {}),
    };
    return json;
}
