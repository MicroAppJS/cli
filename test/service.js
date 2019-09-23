'use strict';


const { cmd, argv, service } = require('../bin/base');
console.log(argv);
service.run(cmd, argv);
