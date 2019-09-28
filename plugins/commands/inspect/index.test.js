'use strict';

/* global expect */

const path = require('path');

describe('Plugin micro-app:inspect', () => {

    it('inspect', () => {
        const { service } = require('../../../bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:inspect',
            link: path.join(__dirname, './index.js'),
        });

        service.run('inspect', { _: [] });
    });

    it('inspect-plugins', () => {
        const { service } = require('../../../bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:inspect',
            link: path.join(__dirname, './index.js'),
        });

        service.run('inspect', { _: [], plugins: true });
    });

    it('inspect-rules', () => {
        const { service } = require('../../../bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:inspect',
            link: path.join(__dirname, './index.js'),
        });

        service.run('inspect', { _: [], rules: true });
    });

    it('inspect-verbose', () => {
        const { service } = require('../../../bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:inspect',
            link: path.join(__dirname, './index.js'),
        });

        service.run('inspect', { _: [], verbose: true });
    });

    it('inspect-path', () => {
        const { service } = require('../../../bin/base');
        service.registerPlugin({
            id: '@micro-app/plugin-webpack-adapter',
        });
        service.registerPlugin({
            id: 'test:inspect',
            link: path.join(__dirname, './index.js'),
        });

        service.run('inspect', { _: [ 'entry.main', 'resolve.alias' ], verbose: true });
    });

});
