'use strict';

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
    'build',
    'clean',
];

const builtIn = Symbol.for('built-in');

module.exports = function(service) {

    extendConfigs.forEach(name => {
        service.registerPlugin({
            id: `cli:plugin-extend-${name}`,
            link: require.resolve(`./extends/${name}`),
            [builtIn]: true,
        });
    });

    commands.forEach(name => {
        service.registerPlugin({
            id: `cli:plugin-command-${name}`,
            link: require.resolve(`./commands/${name}`),
            [builtIn]: true,
        });
    });

};
