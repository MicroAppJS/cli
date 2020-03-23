'use strict';

const microApp = require('@micro-app/core');
const logger = microApp.logger;
const semver = require('semver');
const updateNotifier = require('update-notifier');
const pkg = require('../../../package.json');

exports.checkUpgrade = function() {
    // Notify package upgrade. Check version once a week
    return updateNotifier({
        pkg,
        updateCheckInterval: 1000 * 60 * 60 * 24 * 7,
    }).notify({
        isGlobal: true,
    });
};


exports.checkNode = function() {
    // Ensure minimum supported node version is used
    try {
        const result = semver.satisfies(process.version, pkg.engines.node);
        !result && logger.error(`  You must upgrade node to ${pkg.engines.node} to use ${pkg.name}`);
        return result;
    } catch (error) {
        return true;
    }
};
