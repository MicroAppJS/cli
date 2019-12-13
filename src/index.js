'use strict';

const checker = require('./utils/checker');
if (!checker.checkNode()) {
    process.exit(1);
}
checker.checkUpgrade();

const yParser = require('yargs-parser');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

const Service = require('@micro-app/core');
const { _, logger } = require('@micro-app/shared-utils');

const service = new Service(_.cloneDeep(argv));

// 注册插件
require('./plugins/register')(service);

module.exports = { cmd, argv, service, logger };
