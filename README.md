Boot
===
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependencies][dependencies-image]][dependencies-url]

> Boot an application.


## Installation

``` bash
$ npm install app-boot
```


## Usage

``` javascript
var bootable = require( 'app-boot' );
```

#### bootable( [...args] )

Returns a boot `function`. All provided `arguments` are passed to each registered phase. 

``` javascript
var app = require( 'express' )();

var boot = bootable( app );
```


#### boot.phase( fcn[, thisArg] )

Registers a new boot phase. On boot, phases sequentially execute according to registration order.

``` javascript
function phase1( app, next ) {
	// ...do something...
	next();
}

function phase2( app, next ) {
	var err;
	// ...do something...
	if ( err ) {
		return next( err );
	}
	next();
}

boot.phase( phase1 ).phase( phase2 );
```

Each phase receives all boot `arguments` plus an additional callback to invoke after a phase is complete.

``` javascript
var logger = require( './logger.js' ),
	config = require( './config.js' );

function phase( app, config, logger, next ) {
	logger.info( 'Here!' );
	next();
}

boot = bootable( app, config, logger );
boot.phase( phase );
```

To specify the `this` context for a phase, provide a `thisArg`.

``` javascript
var ctx = {
	'beep': 'boop'
};

function phase( app, config, logger, next ) {
	console.log( this.beep );
	// returns 'boop'

	next();
}

boot = bootable( app, config, logger );
boot.phase( phase, ctx );
```

To mimic [async-waterfall](https://github.com/caolan/async#waterfall), provide a locals `object` upon creating a `boot` sequence.

``` javascript
function phase1( app, locals, next ) {
	locals.beep = 'boop';
	next();
}

function phase2( app, locals, next ) {
	console.log( locals.beep );
	// returns 'boop'

	next();
}

boot = bootable( app, {} );
boot.phase( phase1 ).phase( phase2 );
```



#### boot( clbk )

Boots an application and invokes a callback once all phases complete.

``` javascript
boot( done );

function done( error ) {
	if ( error ) {
		throw error;
	}
	console.log( 'Finished booting...' );
}
```

Calling any phase's `next` callback with an `error` argument will cause the boot sequence to abort.

``` javascript
function phase1( app, next ) {
	// ...do something...
	next( new Error( 'phase1 error' ) );
}

function phase2( app, next ) {
	// ...never reached...
	next();
}

function done( error ) {
	if ( error ) {
		console.log( error.message );
		// returns 'phase1 error'
	}
}

boot = bootable( app );
boot.phase( phase1 ).phase( phase2 );
boot( done );
```


## See Also

*	[parallel-boot-phase](https://github.com/kgryte/parallel-boot-phase)
	-	Creates a parallel boot phase when booting an application. Useful for when phase functions are independent; e.g., connecting to two separate databases which do not share any dependencies.
* 	[bootable](https://github.com/jaredhanson/bootable)
	-	Whereas `bootable` binds an application to the phase `this` context, this module allows passing the application and any other parameters as arguments to each phase.
	-	Rather than hang methods off (and thus mutate) the application, this module returns a `function` which wraps the application in a closure.
*	[express](https://github.com/strongloop/express)
	-	This module employs a design pattern similar to Express' middleware pattern, but with a more general interface. 



## Examples

``` javascript
var express = require( 'express' ),
	debug = require( 'debug' )( 'app-boot:example' ),
	bootable = require( 'app-boot' );

var boot, app;

// Bind middleware to the application...
function mw( app, next ) {
	debug( 'Binding middleware...' );
	app.get( '/beep', onRequest );
	next();
	function onRequest( request, response, next ) {
		console.log( 'Request received...' );
		next();
	}
}

// Mock connecting to a db...
function db( app, next ) {
	debug( 'Connecting to a database...' );
	process.nextTick( onConnect );
	function onConnect() {
		app.db = {};
		next();
	}
}

// Mock creating a server and listening on a port...
function server( app, next ) {
	debug( 'Creating a server and listening for requests...' );
	process.nextTick( onListen );
	function onListen() {
		app.server = {};
		next();
	}
}

// Callback invoked after completing a boot sequence...
function onReady( error ) {
	if ( error ) {
		throw error;
	}
	debug( 'Boot sequence completed...' );
}

// Create an application:
app = express();

// Create a boot function:
boot = bootable( app );

// Register phases:
boot.phase( mw )
	.phase( db )
	.phase( server );

// Boot the application:
boot( onReady );
```

To run the example code from the top-level application directory,

``` bash
$ DEBUG=* node ./examples/index.js
```


## Tests

### Unit

Unit tests use the [Mocha](http://mochajs.org/) test framework with [Chai](http://chaijs.com) assertions. To run the tests, execute the following command in the top-level application directory:

``` bash
$ make test
```

All new feature development should have corresponding unit tests to validate correct functionality.


### Test Coverage

This repository uses [Istanbul](https://github.com/gotwarlost/istanbul) as its code coverage tool. To generate a test coverage report, execute the following command in the top-level application directory:

``` bash
$ make test-cov
```

Istanbul creates a `./reports/coverage` directory. To access an HTML version of the report,

``` bash
$ make view-cov
```


---
## License

[MIT license](http://opensource.org/licenses/MIT).


## Copyright

Copyright &copy; 2015. Athan Reines.


[npm-image]: http://img.shields.io/npm/v/app-boot.svg
[npm-url]: https://npmjs.org/package/app-boot

[travis-image]: http://img.shields.io/travis/kgryte/node-app-boot/master.svg
[travis-url]: https://travis-ci.org/kgryte/node-app-boot

[codecov-image]: https://img.shields.io/codecov/c/github/kgryte/node-app-boot/master.svg
[codecov-url]: https://codecov.io/github/kgryte/node-app-boot?branch=master

[dependencies-image]: http://img.shields.io/david/kgryte/node-app-boot.svg
[dependencies-url]: https://david-dm.org/kgryte/node-app-boot

[dev-dependencies-image]: http://img.shields.io/david/dev/kgryte/node-app-boot.svg
[dev-dependencies-url]: https://david-dm.org/dev/kgryte/node-app-boot

[github-issues-image]: http://img.shields.io/github/issues/kgryte/node-app-boot.svg
[github-issues-url]: https://github.com/kgryte/node-app-boot/issues
