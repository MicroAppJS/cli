#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const yParser = require('yargs-parser');
const argv = yParser(process.argv.slice(2));
const { service } = require('./base');

service.run('build', argv);
