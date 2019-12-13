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

        plugin[Symbol.for('api')].beforeServer(({ args }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
        });
        plugin[Symbol.for('api')].afterServer(({ args }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
        });

        plugin[Symbol.for('api')].onServerInit(({ args, app }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(app).not.toBeUndefined();
            expect(app).not.toBeNull();
        });
        plugin[Symbol.for('api')].onServerInitWillDone(({ args, app }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(app).not.toBeUndefined();
            expect(app).not.toBeNull();
        });
        plugin[Symbol.for('api')].onServerInitDone(({ args, app }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(app).not.toBeUndefined();
            expect(app).not.toBeNull();
        });
        plugin[Symbol.for('api')].onServerRunSuccess(({ args, host, port }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(host).not.toBeUndefined();
            expect(host).not.toBeNull();
            expect(port).not.toBeUndefined();
            expect(port).not.toBeNull();
        });
        plugin[Symbol.for('api')].onServerRunFail(({ args, host, port, err }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(host).not.toBeUndefined();
            expect(host).not.toBeNull();
            expect(port).not.toBeUndefined();
            expect(port).not.toBeNull();
            expect(err).not.toBeUndefined();
            expect(err).not.toBeNull();
        });
        plugin[Symbol.for('api')].beforeServerEntry(({ args, app }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(app).not.toBeUndefined();
            expect(app).not.toBeNull();
        });
        plugin[Symbol.for('api')].afterServerEntry(({ args, app }) => {
            expect(args).not.toBeUndefined();
            expect(args).not.toBeNull();
            expect(app).not.toBeUndefined();
            expect(app).not.toBeNull();
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
