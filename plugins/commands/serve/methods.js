'use strict';

module.exports = api => {

    api.registerMethod('onServerInit', {
        type: api.API_TYPE.EVENT,
        description: '服务初始化时事件',
    });
    api.registerMethod('onServerInitDone', {
        type: api.API_TYPE.EVENT,
        description: '服务初始化完成事件',
    });
    api.registerMethod('onServerRunSuccess', {
        type: api.API_TYPE.EVENT,
        description: '服务运行启动成功时事件',
    });
    api.registerMethod('onServerRunFail', {
        type: api.API_TYPE.EVENT,
        description: '服务运行启动失败时事件',
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
        description: '对服务启动前对 webpack compiler 进行修改, 需要返回所有参数',
    });
    api.registerMethod('beforeDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建前事件',
    });
    api.registerMethod('afterDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建后事件',
    });

};
