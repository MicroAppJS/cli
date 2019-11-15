'use strict';

const shelljs = require('shelljs');
const path = require('path');
const chalk = require('chalk');

module.exports = function bootstrapCommand(api, opts) {

    api.registerMethod('beforeCommandBootstrap', {
        type: api.API_TYPE.EVENT,
        description: '初始化前事件',
    });
    api.registerMethod('afterCommandBootstrap', {
        type: api.API_TYPE.EVENT,
        description: '初始化完毕后事件',
    });

    // start
    api.registerCommand('bootstrap', {
        description: 'bootstrap micro app project.',
        usage: 'micro-app bootstrap [options]',
        options: {
            '-': 'bootstrap default.',
            // '-n <name>': 'only bootstrap <name>.',
        },
        details: `
Examples:
    ${chalk.gray('# bootstrap')}
    micro-app bootstrap
          `.trim(),
    }, args => {
        // return initMicro(api, args);

        const targetGraph = args.forceLocal
            ? new PackageGraph(api.packageGraph.rawPackageList, 'allDependencies', 'forceLocal')
            : api.packageGraph;

        let chain = Promise.resolve();

        chain = chain.then(() => {
            if (this.options.scope) {
                this.logger.notice('filter', 'including %j', this.options.scope);
            }

            if (this.options.ignore) {
                this.logger.notice('filter', 'excluding %j', this.options.ignore);
            }

            if (this.options.since) {
                this.logger.notice('filter', 'changed since %j', this.options.since);
            }

            if (this.options.includeFilteredDependents) {
                this.logger.notice('filter', 'including filtered dependents');
            }

            if (this.options.includeFilteredDependencies) {
                this.logger.notice('filter', 'including filtered dependencies');
            }

            return getFilteredPackages(this.targetGraph, this.execOpts, this.options);
        });
    });
};
