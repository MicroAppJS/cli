'use strict';

const checker = require('./utils/checker');
if (!checker.checkNode()) {
    process.exit(1);
}
checker.checkUpgrade();

const { _, logger, fs, tryRequire, path, yParser, smartMerge } = require('@micro-app/shared-utils');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

const Service = require('@micro-app/core');

/**
 * create instance
 * @param {Object} _argv context
 * @return {Service} service instance
 */
function createService(_argv) {

    const service = new Service(smartMerge(_.cloneDeep(argv), _argv));

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
    return service;
}

const service = createService();

module.exports = { cmd, argv, service, logger, createService };
