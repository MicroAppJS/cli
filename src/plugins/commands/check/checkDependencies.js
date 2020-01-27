'use strict';

const os = require('os');
const { _, chalk, getPadLength, logger: { SPACE_CHAR } } = require('@micro-app/shared-utils');

module.exports = function checkDependencies(api, { title, selfConfig, micros, microsConfig }) {
    const loggerStacks = [];

    if (_.isString(title)) {
        loggerStacks.push('');
        loggerStacks.push(`${SPACE_CHAR} ${chalk.green(title)}:`);
    }

    const selfPackage = selfConfig.package || {};
    const selfDeps = selfPackage.dependencies || {};
    const dependenciesMap = {};
    const microsDeps = micros.reduce((obj, key) => {
        const pkg = microsConfig[key] && microsConfig[key].package;
        if (pkg && _.isPlainObject(pkg.dependencies)) {
            obj[key] = pkg.dependencies;
            Object.keys(pkg.dependencies).forEach(name => {
                if (!dependenciesMap[name]) {
                    dependenciesMap[name] = [];
                }
                dependenciesMap[name].push(key);
            });
        }
        return obj;
    }, {});

    const arrs = Object.keys(selfDeps);
    const padLength = getPadLength(arrs.concat(micros).map(key => ({ name: key })));
    arrs.forEach(key => {
        const _version = selfDeps[key];
        const textStrs = [ `${SPACE_CHAR.repeat(2)} * ${chalk.yellow(_.padEnd(key, padLength))} ${chalk.gray(`[ ${_version} ]`)}` ];
        const _names = dependenciesMap[key] || false;
        if (_names && Array.isArray(_names) && _names.length > 0) {
            _names.forEach(_name => {
                const _microName = chalk.blue(_.padEnd(_name, padLength - 2));
                const _microVersion = microsDeps[_name][key];
                let color = 'gray';
                try {
                    const isNotEq = _version !== _microVersion;
                    color = isNotEq ? 'red' : 'gray';
                } catch (error) {
                    color = 'yellow';
                }
                const _warpperMicroVersion = chalk[color](`[ ${_microVersion} ]`);
                textStrs.push(os.EOL);
                textStrs.push(`${SPACE_CHAR.repeat(2)}${chalk.gray('|--')} ${_microName} ${_warpperMicroVersion}`);
            });
        }
        loggerStacks.push(textStrs.join(' '));
    });

    if (loggerStacks.length) {
        api.logger.logo(os.EOL, loggerStacks.join(os.EOL), os.EOL);
    }
};
