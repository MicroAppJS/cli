'use strict';

// TODO 需要重新定位 check 指令， 进行增强

module.exports = function checkCommand(api) {

    const { chalk } = require('@micro-app/shared-utils');

    const details = `
Examples:
    ${chalk.gray('# dependencies to compare')}
    micro-app check dependencies
    `.trim();

    api.registerCommand('check', {
        description: 'check all dependencies.',
        usage: 'micro-app check [options]',
        options: {
            deps: 'check all dependencies to compare.',
            dependencies: 'check all dependencies to compare.',
        },
        details,
    }, args => {
        const selfConfig = api.selfConfig || {};
        const micros = api.micros || [];
        const microsConfig = api.microsConfig || {};

        const type = args._[0];
        switch (type) {
            case 'deps':
            case 'dependencies': {
                const checkDependencies = require('./checkDependencies');
                const title = 'Dependencies List';
                return checkDependencies(api, { title, selfConfig, micros, microsConfig });
            }
            default:
                api.logger.error(`Not Support options: "${type}" !`);
                return api.runCommand('help', { _: [ 'check' ] });
        }
    });
};

module.exports.configuration = {
    description: '检测依赖是否冲突',
};
