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

const BUILT_IN = Symbol.for('built-in');

module.exports = function(service) {

    extendConfigs.forEach(name => {
        service.registerPlugin({
            id: `cli:plugin-extend-${name}`,
            link: require.resolve(`./extends/${name}`),
            [BUILT_IN]: true,
        });
    });

    commands.forEach(name => {
        service.registerPlugin({
            id: `cli:plugin-command-${name}`,
            link: require.resolve(`./commands/${name}`),
            [BUILT_IN]: true,
        });
    });

};
