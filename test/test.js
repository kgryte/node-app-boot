/* global require, describe, it */
'use strict';

// MODULES //

var chai = require( 'chai' ),
	express = require( 'express' ),
	bootable = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'app-boot', function tests() {

	var app = express();

	it( 'should export a function', function test() {
		expect( bootable ).to.be.a( 'function' );
	});

	it( 'should return a function', function test() {
		expect( bootable( app ) ).to.be.a( 'function' );
	});

	it( 'should return a function having a method for adding boot phases', function test() {
		expect( bootable( app ).phase ).to.be.a( 'function' );
	});

	it( 'should throw an error if provided a phase which is not a function', function test() {
		var values,
			boot,
			i;

		values = [
			'5',
			5,
			NaN,
			true,
			null,
			undefined,
			[],
			{}
		];

		boot = bootable( app );
		for ( i = 0; i < values.length; i++ ) {
			expect( badValue( values[ i ] ) ).to.throw( TypeError );
		}
		function badValue( value ) {
			return function badValue() {
				boot.phase( value );
			};
		}
	});

	it( 'should throw an error if provided a boot callback which is not a function', function test() {
		var values,
			boot,
			i;

		values = [
			'5',
			5,
			NaN,
			true,
			null,
			undefined,
			[],
			{}
		];

		boot = bootable( app );
		for ( i = 0; i < values.length; i++ ) {
			expect( badValue( values[ i ] ) ).to.throw( TypeError );
		}
		function badValue( value ) {
			return function badValue() {
				boot( value );
			};
		}
	});

	it( 'should execute provided phases', function test( done ) {
		var total = 10,
			idx = 0,
			boot,
			i;

		boot = bootable( app );
		for ( i = 0; i < total; i++ ) {
			boot.phase( phase );
		}
		boot( clbk );

		function phase( _app, next ) {
			idx += 1;
			assert.strictEqual( app, _app );
			if ( idx%2 === 0 ) {
				process.nextTick( next );
			} else {
				next();
			}
		}
		function clbk() {
			assert.strictEqual( idx, total );
			done();
		}
	});

	it( 'should abort a boot sequence if a phase returns an error', function test( done ) {
		var total = 10,
			idx = 0,
			boot,
			i;

		boot = bootable( app );
		for ( i = 0; i < total; i++ ) {
			boot.phase( phase );
		}
		boot( clbk );

		function phase( app, next ) {
			idx += 1;
			if ( idx > 4 ) {
				return next( new Error( 'beep' ) );
			}
			next();
		}
		function clbk( error ) {
			if ( error ) {
				assert.strictEqual( idx, 5 );
				assert.strictEqual( error.message, 'beep' );
			} else {
				assert.ok( false );
			}
			done();
		}
	});

	it( 'should abort a boot sequence if a phase throws an error', function test( done ) {
		var total = 10,
			idx = 0,
			boot,
			i;

		boot = bootable( app );
		for ( i = 0; i < total; i++ ) {
			boot.phase( phase );
		}
		boot( clbk );

		function phase( app, next ) {
			idx += 1;
			if ( idx > 4 ) {
				throw new Error( 'beep' );
			}
			next();
		}
		function clbk( error ) {
			if ( error ) {
				assert.strictEqual( idx, 5 );
				assert.strictEqual( error.message, 'beep' );
			} else {
				assert.ok( false );
			}
			done();
		}
	});

	it( 'should support specifying a `this` context when registering a phase', function test( done ) {
		var boot,
			ctx;

		ctx = {
			'beep': 'boop'
		};
		boot = bootable( app );
		boot.phase( phase, ctx );
		boot( clbk );

		function phase( app, next ) {
			/* jshint validthis:true */
			assert.strictEqual( this.beep, 'boop' );
			next();
		}
		function clbk( error ) {
			if ( error ) {
				assert.ok( false );
			}
			done();
		}
	});

});
