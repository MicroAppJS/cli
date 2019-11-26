'use strict';

module.exports = api => {

    api.registerMethod('beforeDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建前事件',
    });
    api.registerMethod('afterDevServer', {
        type: api.API_TYPE.EVENT,
        description: '开发服务创建后事件',
    });

};
