'use strict';

const tryRequire = require('try-require');
const chalk = require('chalk');

module.exports = function ProgressPlugin(api, compiler) {
    const webpack = tryRequire('webpack');

    if (webpack && webpack.ProgressPlugin) {
        let spinner;
        compiler.apply(new webpack.ProgressPlugin({
            modules: false,
            profile: false,
            handler: (percentage, message, ...args) => {
                if (!spinner && percentage <= 0) {
                    spinner = api.logger.spinner('Compiling...');
                    spinner.start();
                }
                if (spinner) {
                    spinner.text = Number(percentage * 100).toFixed(2) + '%  ' + chalk.gray(`( ${message} )`);
                }
                // api.logger.logo(percentage, message, ...args);
                if (spinner && percentage >= 1) {
                    spinner.succeed('Compiled OK!');
                    spinner = null;
                }
            },
        }));
    }
};
