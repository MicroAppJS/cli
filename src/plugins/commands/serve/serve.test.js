'use strict';

/* global expect */

describe('Command serve', () => {

    let PORTS = 10000;
    function getArgvs() {
        const port = PORTS++;
        return { _: [], port };
    }

    it('init run', async () => {

        const { service } = require('../../../../');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-command-serve');
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();

        await service.runCommand('serve', getArgvs());

        expect(service.commands.serve).not.toBeNull();
        expect(service.commands.serve).not.toBeUndefined();
        expect(typeof service.commands.serve).toEqual('object');

    });

    it('register methods', async () => {

        const { service } = require('../../../../');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-command-serve');
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();
        expect(plugin[Symbol.for('api')]).not.toBeNull();

        plugin[Symbol.for('api')].beforeDevServer(({ args }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
        });
        plugin[Symbol.for('api')].afterDevServer(({ args }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
        });

        await service.runCommand('serve', getArgvs());

        expect(service.commands.serve).not.toBeNull();
        expect(service.commands.serve).not.toBeUndefined();
        expect(typeof service.commands.serve).toEqual('object');

    });

    it('register dev methods', async () => {

        const { service } = require('../../../../');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-command-serve');
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();
        expect(plugin[Symbol.for('api')]).not.toBeNull();

        plugin[Symbol.for('api')].beforeDevServer(({ args }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
        });
        plugin[Symbol.for('api')].afterDevServer(({ args }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
        });

        await service.runCommand('serve', getArgvs());

        expect(service.commands.serve).not.toBeNull();
        expect(service.commands.serve).not.toBeUndefined();
        expect(typeof service.commands.serve).toEqual('object');

    });

    it('global cmd config', async () => {

        const { service } = require('../../../../');

        await service.run('serve', Object.assign({
            openSoftLink: true,
            openDisabledEntry: true,
        }, getArgvs()));

    });

});
