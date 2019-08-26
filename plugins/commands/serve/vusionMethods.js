'use strict';

module.exports = api => {

    api.registerMethod('modifyVusionConfig', {
        type: api.API_TYPE.MODIFY,
        description: '对服务启动前对 vusion config 进行修改, 需要返回所有参数',
    });
    api.registerMethod('modifyVusionWebpackConfig', {
        type: api.API_TYPE.MODIFY,
        description: '对服务启动前对 vusion webpackConfig 进行修改, 需要返回所有参数',
    });
    api.registerMethod('modifyDefaultVusionConfig', {
        type: api.API_TYPE.MODIFY,
        description: '初始化修改通用 vusion.config.js, 需要返回所有参数',
    });

};
