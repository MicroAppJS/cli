'use strict';

/* global expect */

describe('Command init', () => {

    it('init', () => {

        const { service } = require('../../../bin/base');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-command-init');
        expect(typeof plugin).toEqual('object');

        service.init();

        expect(plugin._api).not.toBeUndefined();

        plugin._api.beforeCommandInit(({ logger }) => {
            expect(plugin._api.logger).toEqual(logger);
        });

        plugin._api.afterCommandInit(({ from, to }) => {
            expect(from).not.toEqual(to);
            expect(from).not.toBeUndefined();
            expect(to).not.toBeUndefined();
            expect(require(from).micros).toEqual(require(to).micros);
        });

        service.runCommand('init');

        expect(service.commands.init).not.toBeNull();
        expect(service.commands.init).not.toBeUndefined();
        expect(typeof service.commands.init).toEqual('object');

    });

});
