'use strict';

module.exports = function versionCommand(api) {

    const pkg = require('../../../../package.json');

    api.addCommandVersion(pkg);

};

module.exports.configuration = {
    description: '显示当前版本号',
};
