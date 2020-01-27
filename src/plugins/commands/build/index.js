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
            '--mode': 'specify env mode (default: development)',
            '--type <type>': 'adapter type, eg. [ webpack, etc. ].',
        },
        details: `
Examples:
    micro-app build
            `.trim(),
    }, args => {
        const logger = api.logger;

        // TODO 兼容, 下个版本删除
        if (args.t && !args.type) {
            args.type = args.t;
            logger.warn('you should be use "--type <type>"!!!');
        }

        logger.info('[build]', `Starting ${api.mode} build...`);

        // custom BuildProcess
        const createBuildProcess = api.applyPluginHooks('modifyCreateBuildProcess', () => {
            logger.warn('[Plugin]', 'you should be use api.modifyCreateBuildProcess() !');
            return Promise.resolve();
        });

        if (!createBuildProcess || !_.isFunction(createBuildProcess)) {
            logger.throw('[Plugin]', 'api.modifyCreateBuildProcess() must be return function !');
        }

        api.applyPluginHooks('beforeBuild', { args });

        return createBuildProcess({ args })
            .then(() => {
                logger.success('>>> Build Success !!!');
                return { args };
            }).catch(err => {
                logger.error('>>> Build Error >>>');
                logger.error(err);
                return { args, err };
            })
            .then(result => {
                api.applyPluginHooks('afterBuild', result);
            });
    });
};


module.exports.configuration = {
    description: '构建脚本命令行',
};
