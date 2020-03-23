'use strict';

// TODO 需要整理目录结构，需要保留 package.json, 但是要更改内容

module.exports = function BootstrapCommand(api, options = {}) {

    const { chalk, dedent } = require('@micro-app/shared-utils');

    api.registerMethod('beforeCommandBootstrap', {
        type: api.API_TYPE.EVENT,
        description: 'bootstrap 前事件',
    });
    api.registerMethod('afterCommandBootstrap', {
        type: api.API_TYPE.EVENT,
        description: 'bootstrap 完毕后事件',
    });

    // start
    api.registerCommand('bootstrap', {
        description: 'bootstrap micro app project.',
        usage: 'micro-app bootstrap [options]',
        options: {
            '-': 'bootstrap default.',
        // '-n <name>': 'only bootstrap <name>.',
        },
        details: dedent`
            Examples:
                ${chalk.gray('# bootstrap')}
                micro-app bootstrap`,
    }, args => {
        const { registry, npmClient = 'npm', npmClientArgs = [] } = options;
        const { force = false } = args;

        const spinner = api.logger.spinner('bootstrap...');

        const npmConfig = {
            registry,
            npmClient,
            npmClientArgs,
        };

        let chain = Promise.resolve();

        chain = chain.then(() => {
            spinner.start();
        });

        chain = chain.then(() => api.applyPluginHooks('beforeCommandBootstrap', { args, options, npmConfig }));

        chain = chain.then(() => {
            if (npmClient === 'yarn') {
                npmConfig.npmClientArgs.unshift('--pure-lockfile');
            } else {
                npmConfig.npmClientArgs.unshift('--no-save');
            }
        });

        // 判断 node_modules 是否存在
        chain = chain.then(() => initNodeModules(api, { force, npmConfig }));

        chain = chain.then(() => filterPackages(api));

        chain = chain.then(pkgs => bootstrap(api, { force, npmConfig, pkgs }));

        chain = chain.then(pkgs => initSymlinks(api, { pkgs }));

        chain = chain.then(() => api.applyPluginHooks('afterCommandBootstrap', { args, options }));

        return chain.then(() => {
            spinner.succeed('finished!');
        }).catch(e => {
            spinner.fail(e.message);
        });

    });
};


function filterPackages(api) {
    const { _ } = require('@micro-app/shared-utils');

    const allPackages = api.packages;

    if (_.isEmpty(allPackages)) {
        return;
    }

    // init git
    const pkgs = allPackages.filter(item => {
        return item.pkgInfo;
    }).map(item => {
        return item.pkgInfo;
    });

    api.logger.debug('[bootstrap > initPackages]', pkgs.length);
    return pkgs;
}

function initNodeModules(api, { npmConfig }) {
    const { fs } = require('@micro-app/shared-utils');
    const npmInstall = require('./npmInstall');
    const currentNodeModules = api.nodeModulesPath;
    if (fs.pathExistsSync(currentNodeModules)) {
        api.logger.warn('[bootstrap]', 'skip root install!');
        return;
    }
    const root = api.root;
    return npmInstall(root, npmConfig);
}

function bootstrap(api, { force, npmConfig, pkgs }) {
    const { fs, path } = require('@micro-app/shared-utils');
    const npmInstall = require('./npmInstall');
    const tempDir = api.tempDir;
    fs.ensureDirSync(tempDir);
    if (!force) {
        if (fs.pathExistsSync(path.join(api.tempDir, 'node_modles'))) {
            api.logger.warn('[bootstrap]', `${tempDir} is not empty!`);
            return;
        }
    }
    return npmInstall.micros(pkgs, tempDir, npmConfig).then(() => pkgs);
}

function initSymlinks(api, { pkgs }) {
    const initSymlinks = require('./initSymlinks');

    return initSymlinks(api, { filteredPackages: pkgs }).then(() => {
        api.logger.debug('[bootstrap > initSymlinks]', 'finished');
    });
}

module.exports.configuration = {
    description: '初始化命令行',
};
