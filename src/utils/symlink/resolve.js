'use strict';

const readCmdShim = require('read-cmd-shim');
const { path, logger, fs } = require('@micro-app/shared-utils');

module.exports = resolveSymlink;

function resolveSymlink(filePath) {
    logger.silly('resolveSymlink', filePath);

    let result;

    if (process.platform === 'win32') {
        result = resolveWindowsSymlink(filePath);
    } else {
        result = resolvePosixSymlink(filePath);
    }

    logger.verbose('resolveSymlink', [ filePath, result ]);

    return result;
}

function resolveSymbolicLink(filePath) {
    const lstat = fs.lstatSync(filePath);
    const resolvedPath = lstat.isSymbolicLink()
        ? path.resolve(path.dirname(filePath), fs.readlinkSync(filePath))
        : false;

    return {
        resolvedPath,
        lstat,
    };
}

function resolvePosixSymlink(filePath) {
    return resolveSymbolicLink(filePath).resolvedPath;
}

function resolveWindowsSymlink(filePath) {
    const { resolvedPath, lstat } = resolveSymbolicLink(filePath);

    if (lstat.isFile() && !resolvedPath) {
        try {
            return path.resolve(path.dirname(filePath), readCmdShim.sync(filePath));
        } catch (e) {
            return false;
        }
    }

    return resolvedPath && path.resolve(resolvedPath);
}
