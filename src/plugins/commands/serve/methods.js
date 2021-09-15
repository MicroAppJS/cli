'use strict';

module.exports = api => {

    api.registerMethod('beforeDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建前事件',
    });

    api.registerMethod('modifyCreateDevServer', {
        type: api.API_TYPE.MODIFY,
        description: '修改开发服务创建事件, 自定义 Node 服务, 需返回 Promise.resolve({ host, port, url })',
    });

    api.registerMethod('afterDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建后事件',
    });

};
