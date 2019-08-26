'use strict';

const merge = require('webpack-merge');
const resolveConfig = require('./resolve');

module.exports = function(webpackConfig, isDev, { modifyDefaultVusionConfig, resolveVusionConfig, resolveVusionWebpackConfig }) {

    let defaultVusionConfig = {
        // type: 'app',
        isDev,
        webpack: webpackConfig,
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

    webpackConfig = vusionConfig.webpack = merge.smartStrategy({
        entry: 'replace',
    })(config, vusionConfig.webpack);

    // 简单优化
    webpackConfig.resolve.modules = [ ...new Set(webpackConfig.resolve.modules) ];

    if (typeof resolveVusionWebpackConfig === 'function') {
        webpackConfig = resolveVusionWebpackConfig(webpackConfig);
    }

    global.vusionConfig.webpack = webpackConfig;

    if (isDev) {
        return require('./devHot')({});
    }
    return require('./build')({});
};
