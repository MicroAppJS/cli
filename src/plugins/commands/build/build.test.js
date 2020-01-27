'use strict';

/* global expect */

describe('Command serve', () => {

    let PORTS = 10000;
    function getArgvs() {
        const port = PORTS++;
        return { _: [], port };
    }

    it('build run', async () => {

        process.env.NODE_ENV = 'production';
        const { service } = require('../../../../');

        await service.run('build', getArgvs());

        expect(service.commands.build).not.toBeNull();
        expect(service.commands.build).not.toBeUndefined();
        expect(typeof service.commands.build).toEqual('object');

    });

    it('modifyCreateBuildProcess', async () => {

        const { service } = require('../../../../');

        const plugin = service.plugins.find(item => item.id === 'cli:plugin-command-build');
        expect(typeof plugin).toEqual('object');

        await service.init();

        expect(plugin[Symbol.for('api')]).not.toBeUndefined();

        const argv = plugin[Symbol.for('api')].parseArgv();
        expect(argv).not.toBeNull();
        expect(argv).not.toBeUndefined();

        plugin[Symbol.for('api')].modifyCreateBuildProcess(() => {

            return function({ args }) {

                expect(args).not.toBeNull();
                expect(args).not.toBeUndefined();

                return Promise.resolve();
            };
        });

        await service.runCommand('build', getArgvs());

        expect(service.commands.build).not.toBeNull();
        expect(service.commands.build).not.toBeUndefined();
        expect(typeof service.commands.build).toEqual('object');

    });
});
