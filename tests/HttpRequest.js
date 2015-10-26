"use strict";

var DummyServer = require( './DummyServer.js' );
var HttpRequest = require( '../HttpRequest.js' );
var UncompressingReader = require( '../UncompressingReader' );
var UncompressingStreamReader = require( '../UncompressingStreamReader' );

// Unitest.only( true, 'HttpRequest' );

UnitestA( 'HttpRequest error', function ( test ) {

	(new HttpRequest( 'http://127.0.0.1:55555' + '/asd/qwe?zxc=123' ))
	.send( "test", function ( response ) {
		
		test( response.isError() )
		test( response.getError() instanceof Error );

		test.out();
	} );

} );

UnitestA( 'HttpRequest', function ( test ) {
	DummyServer.serveOnce( {
		headers: {
			'Something': 'custom'
		},
		// content: 'hello world'
	}, function ( hostUrl ) {


		(new HttpRequest( hostUrl + '/asd/qwe?zxc=123' ))
		.send( 'hello world', function ( response ) {
			
			test( !response.isError(), response.getError() );
			test( response.getContent().toString() == 'hello world' );
			test( response.getHeaders().something == 'custom' );
			test( response.getStatusCode() == 200 );

			test.out();
		} );

	} );
	
} );


UnitestA( 'HttpRequest UncompressingReader', function ( test ) {
	DummyServer.serveOnce( {
		headers: { 'Content-Encoding': 'gzip' }
		// content: 'hello world'
	}, function ( hostUrl ) {

		(new HttpRequest( hostUrl + '/asd/qwe?zxc=123' ))
		.setHeader( 'Content-Encoding', 'gzip' )
		.send( 'hello world', new UncompressingReader( function ( err, response ) {
			
			test.eq( response.toString(), 'hello world' );

			test.out();
		} ) );

	} );
	
} );

UnitestA( 'HttpRequest UncompressingStreamReader', function ( test ) {
	DummyServer.serveOnce( {
		headers: { 'Content-Encoding': 'gzip' }
		// content: 'hello world'
	}, function ( hostUrl ) {

		(new HttpRequest( hostUrl + '/asd/qwe?zxc=123' ))
		.setHeader( 'Content-Encoding', 'gzip' )
		.send( 'hello world', new class extends UncompressingStreamReader {
			
			onData ( data ) {

				test.eq( data.toString(), 'hello world' );
			}

			onEnd () {

				test.out();
			}

		} );

	} );
	
} );


UnitestA( 'HttpRequest compression', function ( test ) {
	DummyServer.serveOnce( {
		headers: { 'Content-Encoding': 'gzip' }
	}, function ( hostUrl ) {


		(new HttpRequest( hostUrl + '/asd/qwe?zxc=123' ))
		.setHeader( 'Content-Encoding', 'gzip' )
		.send( 'asd яве', function ( response ) {
			
			test( !response.isError(), response.getError() );
			test( response.isCompressed() );
			response.getDecompressed( function ( err, content ) {
				test( !err );
				test( content.toString() === 'asd яве' );
				test.out();
			} );

		} );

	} );
	
} );


UnitestA( 'HttpRequest bad compression', function ( test ) {
	DummyServer.serveOnce( {
		headers: { 'Content-Encoding': 'gzip' }
	}, function ( hostUrl ) {


		(new HttpRequest( hostUrl + '/asd/qwe?zxc=123' ))
		.setHeader( 'Content-Encoding', 'gzip' )
		.dontAutoEncode()
		.send( 'asd яве', function ( response ) {
			
			test( !response.isError(), response.getError() );
			test( response.isCompressed() );
			response.getDecompressed( function ( err, content ) {
				test( err );
				test.out();
			} );

		} );

	} );
	
} );


UnitestA( 'HttpRequest auto json encode', function ( test ) {
	DummyServer.serveOnce( {
	}, function ( hostUrl ) {


		(new HttpRequest( hostUrl + '/asd/qwe?zxc=123' ))
		.setHeader( 'Content-Type', 'application/json' )
		.send( { asd: 'qwe' }, function ( response ) {
			test.eq( response.getContent().toString(), '{"asd":"qwe"}' );
			test.out();

		} );

	} );
	
} );