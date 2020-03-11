'use strict';

const checker = require('./utils/checker');
if (!checker.checkNode()) {
    process.exit(1);
}
checker.checkUpgrade();

const { _, logger, fs, tryRequire, path, yParser } = require('@micro-app/shared-utils');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

const Service = require('@micro-app/core');

const service = new Service(_.cloneDeep(argv));

// 注册插件
require('./plugins/register')(service);

// 预加载插件
// ZAP --pre-register-plugin
if (argv.preRegisterPlugin && _.isString(argv.preRegisterPlugin)) {
    const preRegisterPluginPath = path.resolve(service.root, argv.preRegisterPlugin);
    if (fs.pathExistsSync(preRegisterPluginPath)) {
        const preRegisterPlugin = tryRequire(preRegisterPluginPath);
        if (_.isFunction(preRegisterPlugin)) {
            preRegisterPlugin(service);
        }
    }
}

module.exports = { cmd, argv, service, logger };
