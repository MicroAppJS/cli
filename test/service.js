'use strict';

const { logger } = require('@micro-app/shared-utils');
logger.level = 'silly';
logger.debug('ok!!s');

const { cmd, argv, service } = require('../');
service.run(cmd, argv);
