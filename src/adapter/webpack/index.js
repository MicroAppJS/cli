'use strict';

module.exports = function(webpackConfig, isDev) {
    if (isDev) {
        return require('./devHot')(webpackConfig);
    }
    return require('./build')(webpackConfig);
};
