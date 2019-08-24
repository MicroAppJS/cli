'use strict';

const yParser = require('yargs-parser');
const cmd = process.argv[2];
const argv = yParser(process.argv.slice(3));

const microApp = require('@micro-app/core');
const Service = microApp.Service;

const service = new Service();

// 注册插件
require('../plugins/register')(service);

module.exports = { cmd, argv, service };
