'use strict';
module.exports = function inspectCommand(api, opts) {

    const chalk = require('chalk');
    const _ = require('lodash');

    const logger = api.logger;

    api.registerCommand('inspect', {
        description: 'inspect internal webpack config',
        usage: 'micro-app inspect [options] [...paths]',
        options: {
            '--mode': 'specify env mode (default: development)',
            '--rule <ruleName>': 'inspect a specific module rule',
            '--plugin <pluginName>': 'inspect a specific plugin',
            '--rules': 'list all module rule names',
            '--plugins': 'list all plugin names',
            '--verbose': 'show full function definitions in output',
            '--type <type>': 'adapter type, eg. [ webpack, vusion, etc. ].',
            '--open-soft-link': '启用开发软链接',
            '--open-disabled-entry': '支持可配置禁用部分模块入口.',
        },
        details: `
Examples:
    ${chalk.gray('# vusion')}
    micro-app inspect --type vusion
    ${chalk.gray('# open soft link')}
    micro-app inspect --type vusion --open-soft-link
            `.trim(),
    },
    args => {
        const { toString } = require('webpack-chain');
        const { highlight } = require('cli-highlight');

        const { _: paths, verbose } = args;

        let config = api.resolveWebpackConfig();

        const { webpackConfig } = api.applyPluginHooks('modifyWebpackConfig', {
            args,
            webpackConfig: config,
        });

        if (
            !_.isPlainObject(webpackConfig) || !webpackConfig
        ) {
            logger.error('[Plugin] modifyWebpackConfig must return { args, webpackConfig }');
            return process.exit(1);
        }

        // 更新一次
        api.setState('webpackConfig', webpackConfig);
        config = _.cloneDeep(webpackConfig);

        let res;
        let hasUnnamedRule;
        if (args.rule) {
            res = config.module.rules.find(r => r.__ruleNames[0] === args.rule);
        } else if (args.plugin) {
            res = Array.isArray(config.plugins)
                ? config.plugins.find(p => p.__pluginName === args.plugin)
                : {};
        } else if (args.rules) {
            res = config.module && Array.isArray(config.module.rules)
                ? config.module.rules.map(r => {
                    const name = r.__ruleNames ? r.__ruleNames[0] : 'Nameless Rule (*)';

                    hasUnnamedRule = hasUnnamedRule || !r.__ruleNames;

                    return name;
                })
                : [];
        } else if (args.plugins) {
            res = Array.isArray(config.plugins)
                ? config.plugins.map(p => p.__pluginName || p.constructor.name)
                : [];
        } else if (paths.length > 1) {
            res = {};
            paths.forEach(path => {
                res[path] = _.get(config, path);
            });
        } else if (paths.length === 1) {
            res = _.get(config, paths[0]);
        } else {
            res = config;
        }

        const output = toString(res, { verbose });
        logger.logo(highlight(output, { language: 'js' }));

        // Log explanation for Nameless Rules
        if (hasUnnamedRule) {
            logger.logo(`--- ${chalk.green('Footnotes')} ---`);
            logger.logo(`*: ${chalk.green(
                'Nameless Rules'
            )} were added through the ${chalk.green(
                'configureWebpack()'
            )} API (possibly by a plugin) instead of ${chalk.green(
                'chainWebpack()'
            )} (recommended).
      You can run ${chalk.green(
        'micro-app inspect'
    )} without any arguments to inspect the full config and read these rules' config.`);
        }
    }
    );
};
