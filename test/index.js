'use strict';


// const deploy = require('../libs/deploy');
// deploy();


// const microApp = require('../bin/micro-app-dev');

const { cmd, argv, service } = require('../bin/base');
service.run(cmd, argv);
