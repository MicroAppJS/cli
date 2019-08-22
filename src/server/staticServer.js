'use strict';

const koaStaticServer = require('koa-static');

module.exports = function(contentBase, options) {
    return koaStaticServer(contentBase, Object.assign({
        maxage: 1000 * 60 * 60 * 1,
        index: 'index.html',
    }, options));
};
