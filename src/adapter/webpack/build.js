'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const tryRequire = require('try-require');

module.exports = function(webpackConfig) {

    if (!webpackConfig) {
        logger.error('webpackConfig null...');
        return null;
    }


    const webpack = tryRequire('webpack');
    if (!webpack) {
        logger.error('load webpack error!');
        return null;
    }

    const compiler = webpack(webpackConfig);

    return { compiler, webpackConfig };
};
