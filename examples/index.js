'use strict';

var express = require( 'express' ),
	debug = require( 'debug' )( 'app-boot:example' ),
	bootable = require( './../lib' );

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

