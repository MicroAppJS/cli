'use strict';

/* global expect */

describe('Command version', () => {

    it('version', async () => {

        const { service } = require('../../../');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-command-version');
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin._api).not.toBeUndefined();
        plugin._api.addCommandVersion({
            name: 'a',
            version: 'b',
            description: 'c',
        });

        await service.runCommand('version');

        expect(service.commands.version).not.toBeNull();
        expect(service.commands.version).not.toBeUndefined();
        expect(typeof service.commands.version).toEqual('object');
    });

});
