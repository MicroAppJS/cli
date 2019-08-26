'use strict';

const EventEmitter = require('events').EventEmitter;
const { CONSTANTS } = require('@micro-app/core');

class HookEvent extends EventEmitter {
    constructor(app) {
        super();
        this.app = app;
    }

    hooks(name, listener) {
        const { SCOPE_NAME } = CONSTANTS;
        return this.on(`${SCOPE_NAME}:${name}`, listener);
    }

    send(name, ...args) {
        const { SCOPE_NAME } = CONSTANTS;
        return this.emit(`${SCOPE_NAME}:${name}`, this.app, ...args);
    }
}

module.exports = HookEvent;

