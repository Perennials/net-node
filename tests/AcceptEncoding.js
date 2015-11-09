var AcceptEncoding = require( '../AcceptEncoding.js' );

Unitest( 'AcceptEncoding.accept()', function ( test ) {
	var a = new AcceptEncoding( 'compress, gzip' );
	test( a.accepts( 'gzip' ) === true );
	test( a.accepts( 'compress' ) === true );
	test( a.accepts( 'deflate' ) === false );
	
	var a = new AcceptEncoding( '*' );
	test( a.accepts( 'gzip' ) === true );

	var a = new AcceptEncoding();
	test( a.accepts( 'identity' ) === true );
	test( a.accepts( 'gzip' ) === false );

	var a = new AcceptEncoding( 'compress;q=0.5, gzip;q=1.0' );
	test( a.accepts( 'gzip' ) === true );
	test( a.accepts( 'compress' ) === true );
	test( a.accepts( 'deflate' ) === false );
	test.eq( a.getPreferred(), 'gzip' );
	test( a.isPreferred( 'gzip' ) === true );
	test( a.isPreferred( 'compress' ) === false );
	
	var a = new AcceptEncoding( 'gzip;q=1.0, identity; q=0.5, *;q=0' );
	test( a.accepts( 'gzip' ) === true );
	test( a.accepts( 'identity' ) === true );
	test( a.accepts( 'deflate' ) === false );
	test.eq( a.getPreferred(), 'gzip' );
	test( a.isPreferred( 'gzip' ) === true );

	var a = new AcceptEncoding( 'gzip;q=1.0, identity; q=1.5, *;q=0.1' );
	test( a.accepts( 'gzip' ) === true );
	test( a.accepts( 'identity' ) === true );
	test( a.accepts( 'deflate' ) === true );
	test.eq( a.getPreferred(), 'identity' );
	test( a.isPreferred( 'identity' ) === true );
} );