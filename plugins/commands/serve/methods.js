'use strict';

module.exports = api => {

    api.registerMethod('modifyWebpackConfig', {
        type: api.API_TYPE.MODIFY,
        description: '对服务启动前对 webpack config 进行修改, 需要返回所有参数',
    });

    api.registerMethod('beforeDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建前事件',
    });
    api.registerMethod('afterDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建后事件',
    });

    api.registerMethod('onDevServerMiddleware', {
        type: api.API_TYPE.EVENT,
        description: '开发服务中间件事件, 适用于部分命令中, 如: @micro-app/cli',
    });
};
