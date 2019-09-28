'use strict';

module.exports = function serveCommand(api, opts) {

    const registerMethods = require('./methods');
    const startCommand = require('./start');

    registerMethods(api);

    // start
    startCommand(api, opts);
};
