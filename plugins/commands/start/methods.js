'use strict';

module.exports = api => {

    api.registerMethod('beforeServer', {
        type: api.API_TYPE.EVENT,
        description: '服务启动前事件',
    });

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

    api.registerMethod('afterServer', {
        type: api.API_TYPE.EVENT,
        description: '服务启动后事件',
    });
};
