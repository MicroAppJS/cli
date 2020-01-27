'use strict';

module.exports = function initTempDir(api) {
    const { fs, _ } = require('@micro-app/shared-utils');

    const allPackages = api.packages;

    if (_.isEmpty(allPackages)) {
        return;
    }

    const tempDir = api.tempDir;

    // TODO 初始化临时文件
    if (!fs.existsSync(tempDir)) {
        fs.ensureDirSync(tempDir);
        api.logger.debug('[bootstrap]', 'create scope', tempDir);
    }

    api.logger.debug('[bootstrap]', `tempDir: ${tempDir}`);

    return tempDir;
};
