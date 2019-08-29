'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;

const hotMiddleware = require('webpack-hot-middleware');
const { PassThrough } = require('stream');

module.exports = function(compiler, opts) {
    const expressMiddleware = hotMiddleware(compiler, opts);
    return async (ctx, next) => {
        const stream = new PassThrough();
        return await expressMiddleware(ctx.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                ctx.body = stream; // ok 才赋值
                ctx.status = status;
                ctx.set(headers);
            },
            end: () => {
                logger.debug('hot middleware end!');
            },
        }, next);
    };
};
