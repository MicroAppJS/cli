'use strict';

const chalk = require('chalk');
const createServer = require('./createServer');

module.exports = function(api, opts) {

    api.registerMethod('onServerInit', {
        type: api.API_TYPE.EVENT,
        description: '服务初始化时事件',
    });
    api.registerMethod('onServerInitDone', {
        type: api.API_TYPE.EVENT,
        description: '服务初始化完成事件',
    });
    api.registerMethod('beforeServerEntry', {
        type: api.API_TYPE.EVENT,
        description: '服务进入业务逻辑前事件',
    });
    api.registerMethod('afterServerEntry', {
        type: api.API_TYPE.EVENT,
        description: '服务从业务逻辑出来后事件',
    });
    api.registerMethod('modifyWebpackCompiler', {
        type: api.API_TYPE.MODIFY,
        description: '对服务启动前 webpack compiler 进行修改',
    });

    // start
    api.registerCommand('start', {
        description: 'runs server for production',
        usage: 'micro-app start [options]',
        options: {
            '-t <type>': 'adapter type, eg. [ webpack, vusion ].',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app start -t vusion
          `.trim(),
    }, args => {
        const type = args.t || 'webpack';
        return runServe(api, type, false);
    });

    // serve
    api.registerCommand('serve', {
        description: 'runs server for development',
        usage: 'micro-app serve [options]',
        options: {
            '-t <type>': 'adapter type, eg. [ webpack, vusion ].',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app serve -t vusion
          `.trim(),
    }, args => {
        const type = args.t || 'webpack';
        return runServe(api, type, true);
    });
};

function runServe(api, type, isDev) {
    const webpackConfig = api.getState('webpackConfig');

    let webpackCompiler;
    let webpackDevOptions;

    if (type === 'vusion') {
        const vusionAdapter = require('../../src/adapter/vusion')(webpackConfig, isDev);
        webpackCompiler = vusionAdapter.compiler;
        webpackDevOptions = vusionAdapter.devOptions || {};
    }

    let { compiler, devOptions = {} } = api.applyPluginHooks('modifyWebpackCompiler', {
        type,
        webpackConfig,
        compiler: webpackCompiler,
        devOptions: webpackDevOptions,
    });

    if (!compiler) { // 如果为空
        const webpackAdapter = require('../../src/adapter/webpack')(webpackConfig, isDev);
        compiler = webpackAdapter.compiler;
        devOptions = webpackAdapter.devOptions || {};
    }

    // [ 'post', 'host', 'contentBase', 'entrys', 'hooks' ]; // serverConfig
    const startInfo = {
        type,
        config: api.config,
        serverConfig: api.serverConfig,
        onlyNode: false,
        webpackConfig,
        compiler,
        devOptions,
    };

    return createServer({ ...startInfo,
        isDev,
    }, api);
}
