var DummyServer = require( './DummyServer.js' );
var HttpRequest = require( '../HttpRequest.js' );

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


		debugger;
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