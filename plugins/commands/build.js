'use strict';

const ora = require('ora');
const chalk = require('chalk');

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
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app build -t vusion
          `.trim(),
    }, args => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        const type = args.t || 'webpack';
        return runServe(api, type);
    });
};

function runServe(api, type) {
    const logger = api.logger;
    const webpackConfig = api.getState('webpackConfig');

    let webpackCompiler;
    let webpackDevOptions;

    if (type === 'vusion') {
        const vusionAdapter = require('../../src/adapter/vusion')(webpackConfig, false, {
            resolveVusionConfig(vusionConfig) {
                return api.applyPluginHooks('modifyVusionConfig', vusionConfig);
            },
            resolveVusionWebpackConfig(vusionWebpackConfig) {
                return api.applyPluginHooks('modifyVusionWebpackConfig', vusionWebpackConfig);
            },
        });
        webpackCompiler = vusionAdapter.compiler;
        webpackDevOptions = vusionAdapter.devOptions || {};
    } else {
        const webpackAdapter = require('../../src/adapter/webpack')(webpackConfig, false);
        webpackCompiler = webpackAdapter.compiler;
        webpackDevOptions = webpackAdapter.devOptions || {};
    }

    // 更新一次
    api.setState('webpackConfig', webpackConfig);

    const { compiler, devOptions = {} } = api.applyPluginHooks('modifyWebpackCompiler', {
        type,
        webpackConfig,
        compiler: webpackCompiler,
        devOptions: webpackDevOptions,
    });

    // [ 'post', 'host', 'contentBase', 'entrys', 'hooks' ]; // serverConfig
    const info = {
        type,
        config: api.config,
        serverConfig: api.serverConfig,
        onlyNode: false,
        webpackConfig,
        compiler,
        devOptions,
    };

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

            process.stdout.write(stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false,
            }) + '\n');

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
