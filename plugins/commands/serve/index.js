'use strict';

const registerMethods = require('./methods');
const registerVusionMethods = require('./vusionMethods');
const startCommand = require('./start');
const devCommand = require('./dev');

module.exports = function serveCommand(api, opts) {

    registerMethods(api);

    // vusion
    registerVusionMethods(api);

    // start
    startCommand(api, opts);

    // serve
    devCommand(api, opts);
};
