'use strict';

module.exports = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
    type: '', // types 类型

    entry: {
        main: './test/index.js',
    },

    htmls: [
        {
            template: './test/index.js',
        },
    ],

    // staticPath: '',

    // dlls: [
    //     {
    //         context: __dirname,
    //     },
    // ],

    alias: { // 前端
        api: 'abc',
        config: {
            link: 'abc',
            description: '配置',
        },
        service: {
            link: 'abc',
            description: '接口',
            type: 'server',
        },
    },

    strict: true,

    micros: require('./micros.json'), // 被注册的容器

    // 服务配置
    server: {
        port: 8088, // 服务端口号
    },

    plugins: [
        '@micro-app/plugin-deploy',
        [{
            id: 'test',
            description: '这是test',
            link: __dirname + '/test/testPlugin',
        }, {
            a: 1,
        }],
    ],
};
