/* global require, describe, it */
'use strict';

// MODULES //

var chai = require( 'chai' ),
	bootable = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'app-boot', function tests() {

	it( 'should export a function', function test() {
		expect( bootable ).to.be.a( 'function' );
	});

});
