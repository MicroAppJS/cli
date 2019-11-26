'use strict';

// 'modifyDefaultServerConfig',

module.exports = api => {

    api.registerMethod('modifyDefaultServerConfig', {
        type: api.API_TYPE.MODIFY,
        description: '修改服务端配置合并事件',
    });

};
