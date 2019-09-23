'use strict';

const checker = require('../src/utils/checker');
if (!checker.checkNode()) {
    process.exit(1);
}
checker.checkUpgrade();

const yParser = require('yargs-parser');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

// 全局环境
if ([ 'start', 'build' ].includes(cmd)) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
} else if ([ 'serve' ].includes(cmd)) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
}

// 全局指令
process.env.MICRO_APP_OPEN_SOFT_LINK = argv.openSoftLink || false; // 开启软链接
process.env.MICRO_APP_OPEN_DISABLED_ENTRY = argv.openDisabledEntry || false; // 开启禁用指定模块入口, 优化开发速度

const microApp = require('@micro-app/core');
const Service = microApp.Service;

const service = new Service();

// 注册插件
require('../plugins/register')(service);

module.exports = { cmd, argv, service };
