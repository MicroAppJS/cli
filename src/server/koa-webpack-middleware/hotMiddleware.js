'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;

const hotMiddleware = require('webpack-hot-middleware');
const { PassThrough } = require('stream');

module.exports = function(compiler, opts) {
    const expressMiddleware = hotMiddleware(compiler, opts);
    return async (ctx, next) => {
        const stream = new PassThrough();
        ctx.body = stream;
        await expressMiddleware(ctx.req, {
            write: stream.write.bind(stream),
            writeHead: (status, headers) => {
                ctx.status = status;
                ctx.set(headers);
            },
            end: () => {
                logger.warn('hotMiddleware end!');
            },
        }, next);
    };
};