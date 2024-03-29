# Micro APP CLI

Pluggable micro application framework.

基于webpack多入口的多仓库业务模块开发的插件应用框架脚手架.

[![Github Actions Coveralls][Github-Actions-Coveralls]][Github-Actions-Coveralls-url]
[![Coverage Status][Coverage-img]][Coverage-url]
[![NPM Version][npm-img]][npm-url]
[![NPM Download][download-img]][download-url]

[Github-Actions-Coveralls]: https://github.com/MicroAppJS/cli/workflows/Coveralls/badge.svg
[Github-Actions-Coveralls-url]: https://github.com/MicroAppJS/cli
[Coverage-img]: https://coveralls.io/repos/github/MicroAppJS/cli/badge.svg?branch=master
[Coverage-url]: https://coveralls.io/github/MicroAppJS/cli?branch=master
[npm-img]: https://img.shields.io/npm/v/@micro-app/cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@micro-app/cli
[download-img]: https://img.shields.io/npm/dm/@micro-app/cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/@micro-app/cli

## Install

```sh
yarn add @micro-app/cli
```

or

```sh
npm install -D @micro-app/cli
```

## Usage

### 在项目 `根目录` 初始化创建一个 `micro-app.config.js` 文件

```sh
npx micro-app init
```

### 对 `micro-app.config.js` 配置文件进行编辑

```js
module.exports = {
    name: '@micro-app/demo',
    description: '',
    version: '0.0.1',
    type: '', // types 类型

    staticPath: [], // String | Array

    entry: { // 入口
        main: './test/index.js',
    },

    htmls: [ // 输出模版配置
        {
            template: './test/index.js',
        },
    ],

    alias: { // 别名配置
        api: '',
        config: {
            link: '',
            description: '配置',
        },
        service: {
            link: '',
            description: '接口',
            type: 'server',
        },
    },

    strict: true, // 严格强依赖模式

    micros: [ 'test' ], // 被注册的容器

    // 服务配置
    server: {
        hooks: '',
        entry: '', // 服务端入口
        port: 8088, // 服务端口号
    },

    plugins: [ // 自定义插件
        // [{
        //     id: 'test',
        //     description: '这是test',
        //     link: __dirname + '/test/testPlugin',
        // }, {
        //     a: 1,
        // }],
    ],
};
```

### 在 `package.json` 中加载其他模块, 例如

```json
    "dependencies": {
        "@micro-app/test": "git+ssh://git@github.com/micro-app.git#test"
    },
```

### 开发模式

```sh
npx micro-app serve
```

or

```sh
npx micro-app-dev
```

### 运行

```sh
npx micro-app start
```

or

```sh
npx micro-app-start
```

## 项目中使用共享接口

```js
const api = require('@micro-demo/api');
```

## Plugins 扩展

### 首先在 micro-app.config.js 中注册插件

```js
plugins: [
        [ // 1
            {
                id: 'test', // 插件 id
                description: '这是test', // 插件描述
                link: __dirname + '/test/testPlugin.js',  // 插件地址
            }, { // 注册入的 opts
                a: 1,
            }
        ],
    ],
```

### 插件文件 `testPlugin.js`

文件必须返回一个方法.

```js
module.exports = function(api, opts) {
    console.log(opts);
    api.onInitDone(item => {
        console.log('init Done', item);
    });
    api.onInitDone(() => {
        console.log('init Done2', api.getState('webpackConfig'));
    });
    api.onPluginInitDone(item => {
        console.log('onPluginInitDone', item);
    });
};
```

### 内置部分插件提供的 api 方法

可通过如下命令进行动态查看

```js
npx micro-app show methods
```

以提供的方法如下, `System Build-in` 为内置方法

```js
╰─➤  npx micro-app show methods
  Plugin Methods:
     * onPluginInitDone            ( System Build-in )
     * beforeMergeConfig           ( System Build-in )
     * afterMergeConfig            ( System Build-in )
     * modifyDefaultServerConfig   ( System Build-in )
     * onInitWillDone              ( System Build-in )
     * onInitDone                  ( System Build-in )
     * modifyCommand               ( System Build-in )
     * onRunCommand                ( System Build-in )
     * modifyCommandHelp           ( System Build-in )
     * modifyWebpackConfig         ( 合并之后提供 webpack config 进行再次修改事件 )
     * onServerInit                ( 服务初始化时事件 )
     * onServerInitWillDone        ( 服务初始化即将完成事件 )
     * onServerInitDone            ( 服务初始化完成事件 )
     * onServerRunSuccess          ( 服务运行启动成功时事件 )
     * onServerRunFail             ( 服务运行启动失败时事件 )
     * beforeServerEntry           ( 服务进入业务逻辑前事件 )
     * afterServerEntry            ( 服务从业务逻辑出来后事件 )
     * beforeDevServer             ( 开发服务创建前事件 )
     * afterDevServer              ( 开发服务创建后事件 )
     * onBuildSuccess              ( 构建成功时事件 )
     * onBuildFail                 ( 构建失败时事件 )
     * beforeBuild                 ( 开始构建前事件 )
     * afterBuild                  ( 构建结束后事件 )
     * beforeCommandUpdate         ( 开始更新前事件 )
     * afterCommandUpdate          ( 更新完毕后事件 )
     * beforeCommandDeploy         ( 发布前事件 )
     * afterCommandDeploy          ( 发布后事件 )
     * modifyCommandDeployMessage  ( 发布消息二次编辑事件 )

// 以下为针对 vusion 类型的方法
     * modifyVusionConfig          ( 对服务启动前对 vusion config 进行修改, 需要返回所有参数 )
     * modifyVusionWebpackConfig   ( 对服务启动前对 vusion webpackConfig 进行修改, 需要返回所有参数 )
     * modifyDefaultVusionConfig   ( 初始化修改通用 vusion.config.js, 需要返回所有参数 )
```

### api 方法扩展

可参考以下插件, 如:

```js
    // 注册一个方法
    api.registerMethod('beforeCommandUpdate', {
        type: api.API_TYPE.EVENT,
        description: '开始更新前事件',
    });

    // 注册一个终端命令
    api.registerCommand('update', {
        description: 'update package.json',
        usage: 'micro-app update [options]',
        options: {
            '--all': 'update all.',
            '-n <name>': 'only update <name>.',
        },
        details: `
Examples:
    ${chalk.gray('# update all')}
    micro-app update --all
    ${chalk.gray('# only update <name>')}
    micro-app update -name <name>
          `.trim(),
    }, args => {
        const name = args.name;
        return updateMicro(api, name);
    });

    // 对外触发已注册的方法.
    api.applyPluginHooks('beforeCommandUpdate', { name, logger, microsConfig });

```

其它插件使用 `beforeCommandUpdate` 方法, 如下:

```js
    api.beforeCommandUpdate(item => {
        console.log('beforeCommandUpdate', item);
    });
```

## 其他

### 已支持的终端命令行

```js
╰─➤  npx micro-app help


  Usage: micro-app <command> [options]


  Commands:
      * show       ( show alias & shared list, etc. )
      * check      ( check all dependencies. )
      * version    ( show version )
      * start      ( runs server for production )
      * serve      ( runs server for development )
      * build      ( build for production )
      * update     ( update package.json )
      * deploy     ( sync commit status. )


  run micro-app help [command] for usage of a specific command.
```

### 展示所有容器

```js
npx micro-app show micros
```

### 展示所有前端共享接口

```js
npx micro-app show alias
```

### 展示所有全局共享接口

```js
npx micro-app show shared
```

### 启动开发模式

```js
npx micro-app-dev --progress
```
