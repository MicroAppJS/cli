'use strict';

const resolveConfig = require('./resolve');

module.exports = function(webpack, isDev, { modifyDefaultVusionConfig, resolveVusionConfig, resolveVusionWebpackConfig }) {

    let defaultVusionConfig = {
        // type: 'app',
        isDev,
        webpack,
        needLoadFile: true,
    };
    if (typeof modifyDefaultVusionConfig === 'function') {
        defaultVusionConfig = modifyDefaultVusionConfig(defaultVusionConfig);
    }

    let vusionConfig = resolveConfig(defaultVusionConfig);

    if (typeof resolveVusionConfig === 'function') {
        vusionConfig = resolveVusionConfig(vusionConfig);
    }

    global.vusionConfig = vusionConfig; // fixed vusion

    const config = require('./config')(vusionConfig);

    let { devOptions, webpackConfig } = isDev ? require('./devHot')(config) : require('./build')(config);

    // 简单优化
    webpackConfig.resolve.modules = [ ...new Set(webpackConfig.resolve.modules) ];

    if (typeof resolveVusionWebpackConfig === 'function') {
        webpackConfig = resolveVusionWebpackConfig(webpackConfig);
    }

    return { webpackConfig, devOptions };
};
