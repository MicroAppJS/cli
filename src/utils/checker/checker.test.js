'use strict';

/* global expect */

const checker = require('.');

describe('checker', () => {

    it('should be true', () => {
        expect(checker.checkNode()).toEqual(true);
    });
});
