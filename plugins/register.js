'use strict';

const path = require('path');

const commands = [
    {
        name: 'version',
        description: '显示当前版本号',
    },
    {
        name: 'serve',
        description: '服务启动命令行',
    },
    {
        name: 'build',
        description: '构建命令行',
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

    commands.forEach(item => {
        const name = item.name;
        const description = item.description;
        service.registerPlugin({
            id: `cli:plugins-commands-${name}`,
            link: path.resolve(__dirname, './commands', name),
            description,
        });
    });

};
