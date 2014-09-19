var DummyServer = require( './DummyServer.js' );
var HttpRequest = require( '../HttpRequest.js' );

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
			'Something': 'custom',
			'Connection': 'keep-alive'
		},
		// content: 'hello world'
	}, function () {


		(new HttpRequest( 'http://127.0.0.1:' + DummyServer.defPort + '/asd/qwe?zxc=123' ))
		.send( 'hello world', function ( response ) {
			
			test( !response.isError(), response.getError() );
			test( response.getContent().toString() == 'hello world' );
			test( response.getHeaders().something == 'custom' );
			test( response.getStatusCode() == 200 );

			test.out();
		} );

	} );
	
} );