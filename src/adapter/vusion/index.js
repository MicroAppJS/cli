'use strict';

const resolveConfig = require('./resolve');

module.exports = function(webpackConfig, isDev) {
    const vusionConfig = resolveConfig(webpackConfig);
    if (isDev) {
        return require('./devHot')(vusionConfig);
    }
    return require('./build')(vusionConfig);
};
