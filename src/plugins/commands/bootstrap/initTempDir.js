'use strict';

module.exports = function initTempDir(api) {
    const path = require('path');
    const { fs, _ } = require('@micro-app/shared-utils');

    const allPackages = api.packages;

    if (_.isEmpty(allPackages)) {
        return;
    }

    let tempDir;

    // TODO 初始化临时文件
    const scope = api.tempDirName;
    if (_.isString(scope)) {
        const _tempDir = path.resolve(api.root, scope);
        if (!fs.existsSync(_tempDir)) {
            fs.mkdirpSync(_tempDir);
            api.logger.debug('create scope', _tempDir);
        }
        if (!tempDir) {
            tempDir = _tempDir;
        }
    }

    api.logger.debug('[bootstrap]', `tempDir: ${tempDir}`);

    return tempDir;
};
