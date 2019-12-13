'use strict';

/* global expect */

describe('server', () => {

    it('server adapter', async () => {
        const { service } = require('../../../../');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-extend-server');
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();

        expect(plugin[Symbol.for('api')].selfConfig).not.toBeNull();
        expect(plugin[Symbol.for('api')].selfConfig).not.toBeUndefined();

        expect(plugin[Symbol.for('api')].selfServerConfig).not.toBeNull();
        expect(plugin[Symbol.for('api')].selfServerConfig).not.toBeUndefined();

        expect(plugin[Symbol.for('api')].microsServerConfig).not.toBeNull();
        expect(plugin[Symbol.for('api')].microsServerConfig).not.toBeUndefined();
    });

});
