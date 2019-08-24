'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const tryRequire = require('try-require');
const path = require('path');

module.exports = function(webpackConfig) {

    let buildCompiler = tryRequire('vusion-cli/lib/build');
    if (!buildCompiler) {
        buildCompiler = tryRequire(path.join(process.cwd(), 'node_modules', 'vusion-cli/lib/build'));
        if (!buildCompiler) {
            logger.error('load vusion-cli error!');
            return null;
        }
    }
    const finalWebpackConfig = buildCompiler.prepare(webpackConfig);

    const webpack = tryRequire('webpack');
    if (!webpack) {
        logger.error('load webpack error!');
        return null;
    }

    // 优化处理
    const compiler = webpack(finalWebpackConfig);

    return { compiler, webpackConfig: finalWebpackConfig };

    // return new Promise((resolve, reject) => {
    //     const spinner = ora('Building for production...');
    //     spinner.start();
    //     compiler.run((err, stats) => {
    //         spinner.stop();
    //         if (err) {
    //             // 在这里处理错误
    //             return reject(err);
    //         }

    //         process.stdout.write(stats.toString({
    //             colors: true,
    //             modules: false,
    //             children: false,
    //             chunks: false,
    //             chunkModules: false,
    //         }) + '\n');
    //         // 处理完成
    //         resolve();
    //     });
    // });
};
