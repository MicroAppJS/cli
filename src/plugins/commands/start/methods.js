'use strict';

module.exports = api => {

    api.registerMethod('beforeServer', {
        type: api.API_TYPE.EVENT,
        description: '服务启动前事件',
    });
    api.registerMethod('afterServer', {
        type: api.API_TYPE.EVENT,
        description: '服务启动后事件',
    });
    api.registerMethod('modifyCreateServer', {
        type: api.API_TYPE.MODIFY,
        description: '修改内部服务创建事件, 自定义 Node 服务, 需返回 Promise.resolve({ host, port, url })',
    });

    // 以下只在内置服务中触发.
    api.registerMethod('onServerInit', {
        type: api.API_TYPE.EVENT,
        description: '服务初始化时事件',
    });
    api.registerMethod('beforeServerEntry', {
        type: api.API_TYPE.EVENT,
        description: '服务进入业务逻辑前事件',
    });
    api.registerMethod('onServerEntry', {
        type: api.API_TYPE.EVENT,
        description: '服务进入业务逻辑事件',
    });
    api.registerMethod('afterServerEntry', {
        type: api.API_TYPE.EVENT,
        description: '服务从业务逻辑出来后事件',
    });
    api.registerMethod('onServerInitWillDone', {
        type: api.API_TYPE.EVENT,
        description: '服务初始化即将完成事件',
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

};
