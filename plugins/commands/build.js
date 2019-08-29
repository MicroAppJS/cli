'use strict';

const chalk = require('chalk');
const webpackAdapter = require('../../src/adapter');

module.exports = function buildCommand(api, opts) {

    api.registerMethod('onBuildSuccess', {
        type: api.API_TYPE.EVENT,
        description: '构建成功时事件',
    });
    api.registerMethod('onBuildFail', {
        type: api.API_TYPE.EVENT,
        description: '构建失败时事件',
    });
    api.registerMethod('beforeBuild', {
        type: api.API_TYPE.EVENT,
        description: '开始构建前事件',
    });
    api.registerMethod('afterBuild', {
        type: api.API_TYPE.EVENT,
        description: '构建结束后事件',
    });

    // start
    api.registerCommand('build', {
        description: 'build for production',
        usage: 'micro-app build [options]',
        options: {
            '-': 'default webpack.',
            '-t <type>': 'adapter type, eg. [ webpack, vusion ].',
            '--progress': 'show how progress is reported during a compilation.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app build -t vusion
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        const type = args.t || 'webpack';
        const progress = args.progress;
        return runBuild(api, { type, progress });
    });
};

function runBuild(api, { type, progress }) {
    const logger = api.logger;

    // [ 'post', 'host', 'contentBase', 'entrys', 'hooks' ]; // serverConfig
    const info = {
        type,
        config: api.config,
        serverConfig: api.serverConfig,
    };

    const { compiler, devOptions, webpackConfig } = webpackAdapter(api, { type, isDev: false, progress });

    info.compiler = compiler;
    info.devOptions = devOptions;
    info.webpackConfig = webpackConfig;

    return new Promise((resolve, reject) => {
        const spinner = logger.spinner('Building for production...');
        spinner.start();
        api.applyPluginHooks('beforeBuild', info);
        compiler.run((err, stats) => {
            api.applyPluginHooks('afterBuild', { err, stats });
            spinner.stop();
            if (err) {
                // 在这里处理错误
                api.applyPluginHooks('onBuildFail', { err, stats });
                return reject(err);
            }

            process.stdout.write(stats.toString(Object.assign({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false,
            }, webpackConfig.stats || {})) + '\n');

            api.applyPluginHooks('onBuildSuccess', stats);
            // 处理完成
            resolve();
        });
    }).then(() => {
        api.logger.success('>>> Build Success >>>');
    }).catch(e => {
        api.logger.error('>>> Build Error >>>', e);
    });
}
