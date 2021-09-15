'use strict';

module.exports = api => {

    api.registerMethod('beforeBuild', {
        type: api.API_TYPE.EVENT,
        description: '开始构建前事件',
    });

    api.registerMethod('modifyCreateBuildProcess', {
        type: api.API_TYPE.MODIFY,
        description: '修改构建事件, 需返回 Promise.resolve()',
    });

    api.registerMethod('afterBuild', {
        type: api.API_TYPE.EVENT,
        description: '构建结束后事件',
    });

};
