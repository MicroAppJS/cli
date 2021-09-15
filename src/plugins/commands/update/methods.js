'use strict';

module.exports = api => {

    api.registerMethod('beforeCommandUpdate', {
        type: api.API_TYPE.EVENT,
        description: '开始更新前事件',
    });
    api.registerMethod('afterCommandUpdate', {
        type: api.API_TYPE.EVENT,
        description: '更新完毕后事件',
    });

};
