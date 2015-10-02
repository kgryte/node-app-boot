'use strict';

// MODULES //

var debug = require( 'debug' )( 'app-boot:main' ),
	isFunction = require( 'validate.io-function' ),
	fname = require( 'utils-function-name' ),
	wrap = require( 'utils-try-function' );


// BOOT //

/**
* FUNCTION: bootable()
*	Returns a boot function.
*
* @param {...*} [args] - phase arguments
* @returns {Function} boot function
*/
function bootable() {
	var phases,
		names,
		done,
		args,
		len,
		idx,
		i;

	len = arguments.length;
	args = new Array( len );
	for ( i = 0; i < len; i++ ) {
		args[ i ] = arguments[ i ];
	}
	args.push( next );
	phases = [];
	names = [];
	idx = -1;

	/**
	* FUNCTION: boot( clbk )
	*	Boots an application.
	*
	* @param {Function} clbk - callback to invoke after booting an application
	* @returns {Void}
	*/
	function boot( clbk ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'invalid input argument. Must provide a function. Value: `' + clbk + '`.' );
		}
		done = clbk;
		debug( 'Booting the application.' );
		next();
	} // end FUNCTION boot()

	/**
	* FUNCTION: phase( fcn[, thisArg] )
	*	Registers a boot phase.
	*
	* @param {Function} fcn - phase
	* @param {*} [thisArg] - phase context
	* @returns {Function} boot function
	*/
	function phase( fcn, thisArg ) {
		var name,
			ctx;
		if ( !isFunction( fcn ) ) {
			throw new TypeError( 'invalid input argument. Must provide a function. Value: `' + fcn + '`.' );
		}
		if ( arguments.length > 1 ) {
			ctx = thisArg;
		} else {
			ctx = null;
		}
		name = fname( fcn );
		debug( 'Registering a new phase: `%s` (%d)', name, phases.length );

		phases.push( wrap( fcn, thisArg ) );
		names.push( name );

		return boot;
	} // end FUNCTION phase()

	/**
	* FUNCTION: next( [error] )
	*	Runs the next boot phase.
	*
	* @private
	* @param {Error} [error] - error object
	* @returns {Void}
	*/
	function next( error ) {
		var err;
		if ( error ) {
			debug( '`%s` (%d) boot phase returned an error: %s', names[ idx ], idx, error.message );
			return done( error );
		}
		if ( idx >= 0 ) {
			debug( 'Finished boot phase: `%s` (%d)', names[ idx ], idx );
		}
		idx += 1;
		if ( idx === phases.length ) {
			debug( 'Finished booting the application.' );
			return done();
		}
		debug( 'Entering boot phase: `%s` (%d)', names[ idx], idx );
		err = phases[ idx ].apply( null, args );
		if ( err instanceof Error ) {
			return next( err );
		}
	} // end FUNCTION next()

	boot.phase = phase;
	return boot;
} // end FUNCTION bootable()


// EXPORTS //

module.exports = bootable;
