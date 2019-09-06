'use strict';

const registerMethods = require('./methods');
const startCommand = require('./start');
const devCommand = require('./dev');

module.exports = function serveCommand(api, opts) {

    registerMethods(api);

    // start
    startCommand(api, opts);

    // serve
    devCommand(api, opts);
};
