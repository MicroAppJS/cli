'use strict';

/* global expect */

const checker = require('./checker');

describe('checker', () => {

    it('should be true', () => {
        expect(checker.checkNode()).toEqual(true);
    });
});
