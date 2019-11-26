'use strict';

const checker = require('./utils/checker');
if (!checker.checkNode()) {
    process.exit(1);
}
checker.checkUpgrade();

const yParser = require('yargs-parser');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

// 全局环境模式 production, development
process.env.NODE_ENV = argv.mode || process.env.NODE_ENV || 'development';

const { Service, logger } = require('@micro-app/core');

// 全局指令
if (argv.openSoftLink) {
    process.env.MICRO_APP_OPEN_SOFT_LINK = argv.openSoftLink || false; // 开启软链接
    if (process.env.MICRO_APP_OPEN_SOFT_LINK === 'true') {
        logger.info(`开启软链接; --open-soft-link = ${process.env.MICRO_APP_OPEN_SOFT_LINK}`);
    }
}
if (argv.openDisabledEntry) {
    process.env.MICRO_APP_OPEN_DISABLED_ENTRY = argv.openDisabledEntry || false; // 开启禁用指定模块入口, 优化开发速度
    if (process.env.MICRO_APP_OPEN_DISABLED_ENTRY === 'true') {
        logger.info(`开启禁用指定模块入口; --open-disabled-entry = ${process.env.MICRO_APP_OPEN_DISABLED_ENTRY}`);
    }
}

const service = new Service();

// 注册插件
require('./plugins/register')(service);

module.exports = { cmd, argv, service, logger };
