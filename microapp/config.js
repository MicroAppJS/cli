'use strict';

module.exports = {
    type: '', // types 类型

    entry: {
        main: './test/index.js',
    },

    // htmls: [
    //     {
    //         template: './test/index.js',
    //     },
    // ],

    // staticPath: '',

    // alias: { // 前端
    //     api: 'abc',
    //     config: {
    //         link: 'abc',
    //         description: '配置',
    //     },
    //     service: {
    //         link: 'abc',
    //         description: '接口',
    //         type: 'server',
    //     },
    // },

    micros: {}, // 被注册的容器

    // 服务配置
    server: {
        port: 8088, // 服务端口号
    },

    plugins: [
        '@micro-app/plugin-deploy',
    ],

    options: {}, // 合并
};
