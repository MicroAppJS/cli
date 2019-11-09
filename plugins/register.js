'use strict';

const path = require('path');

const extendConfigs = [
    {
        name: 'server',
        description: '针对服务信息进行配置扩展.',
    },
];

const commands = [
    {
        name: 'version',
        description: '显示当前版本号',
    },
    {
        name: 'start',
        description: '服务启动命令行',
    },
    {
        name: 'serve',
        description: '服务开发命令行',
    },
    {
        name: 'update',
        description: '强制更新 micros 依赖服务命令行',
    },
    {
        name: 'init',
        description: '初始化命令行',
    },
];

module.exports = function(service) {

    extendConfigs.forEach(item => {
        const name = item.name;
        const description = item.description;
        service.registerPlugin({
            id: `cli:plugin-extend-${name}`,
            link: path.resolve(__dirname, './extends', name),
            description,
        });
    });

    commands.forEach(item => {
        const name = item.name;
        const description = item.description;
        service.registerPlugin({
            id: `cli:plugin-command-${name}`,
            link: path.resolve(__dirname, './commands', name),
            description,
        });
    });

};
