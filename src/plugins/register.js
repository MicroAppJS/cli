'use strict';

const path = require('path');

const extendConfigs = [
    'server',
];

const commands = [
    'version',
    'start',
    'serve',
    'update',
    'init',
    'bootstrap',
    'check',
];

module.exports = function(service) {

    extendConfigs.forEach(name => {
        service.registerPlugin({
            id: `cli:plugin-extend-${name}`,
            link: path.resolve(__dirname, './extends', name),
        });
    });

    commands.forEach(name => {
        service.registerPlugin({
            id: `cli:plugin-command-${name}`,
            link: path.resolve(__dirname, './commands', name),
        });
    });

};
