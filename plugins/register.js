'use strict';

const path = require('path');

module.exports = function(service) {

    service.registerPlugin({
        id: 'cli:plugins-commands-version',
        link: path.resolve(__dirname, './commands/version'),
        description: '显示当前版本号',
    });

    service.registerPlugin({
        id: 'cli:plugins-commands-serve',
        link: path.resolve(__dirname, './commands/serve'),
        description: '服务启动命令行',
    });

    service.registerPlugin({
        id: 'cli:plugins-commands-build',
        link: path.resolve(__dirname, './commands/build'),
        description: '构建命令行',
    });

    service.registerPlugin({
        id: 'cli:plugins-commands-update',
        link: path.resolve(__dirname, './commands/update'),
        description: '强制更新 micros 依赖服务命令行',
    });

    service.registerPlugin({
        id: 'cli:plugins-commands-deploy',
        link: path.resolve(__dirname, './commands/deploy'),
        description: '强制发布更新当前提交信息到指定 git 中命令行',
    });

};
