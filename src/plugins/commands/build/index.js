'use strict';

module.exports = function buildCommand(api, opts) {

    const registerMethods = require('./methods');
    registerMethods(api);

    const { _ } = require('@micro-app/shared-utils');

    // build
    api.registerCommand('build', {
        description: 'build for production',
        usage: 'micro-app build [options]',
        options: {
            '--mode <mode>': 'specify env mode (default: "development")',
            '--target <target>': 'app | lib | node etc. (default: "app")',
        },
        details: `
Examples:
    micro-app build
            `.trim(),
    }, args => {
        const logger = api.logger;

        logger.info('[build]', `Starting ${api.mode} build...`);

        api.applyPluginHooks('beforeBuild', { args });

        // custom BuildProcess
        const createBuildProcess = api.applyPluginHooks('modifyCreateBuildProcess', () => {
            logger.warn('[Plugin]', 'you should be use api.modifyCreateBuildProcess() !');
            return Promise.resolve();
        });

        if (!createBuildProcess || !_.isFunction(createBuildProcess)) {
            logger.throw('[Plugin]', 'api.modifyCreateBuildProcess() must be return function !');
        }

        return createBuildProcess({ args })
            .then(() => {
                logger.success('>>> Build Success !!!');

                api.applyPluginHooks('afterBuild', { args });
                return Promise.resolve({ args });
            }).catch(err => {
                logger.error('>>> Build Error >>>');
                logger.error(err);

                api.applyPluginHooks('afterBuild', { args, err });
                return Promise.reject({ args, err });
            });
    });
};


module.exports.configuration = {
    description: '构建脚本命令行',
};
