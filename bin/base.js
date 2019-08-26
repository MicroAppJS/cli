'use strict';

const checker = require('../src/utils/checker');
if (!checker.checkNode()) {
    process.exit(1);
}
checker.checkUpgrade();

const yParser = require('yargs-parser');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

// 全局指令
if (!global.MicroAppConfig) {
    global.MicroAppConfig = {};
}
const MicroAppConfig = global.MicroAppConfig;
MicroAppConfig.OPEN_SOFT_LINK = argv.openSoftLink || false; // 开启软链接
MicroAppConfig.OPEN_DISABLED_ENTRY = argv.openDisabledEntry || false; // 开启禁用指定模块入口, 优化开发速度

const microApp = require('@micro-app/core');
const Service = microApp.Service;

const service = new Service();

// 注册插件
require('../plugins/register')(service);

module.exports = { cmd, argv, service };
