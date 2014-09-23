var QueryString = require( '../QueryString.js' );
var querystring = require( 'querystring' );

Unitest( 'QueryString.encode()', function ( test ) {
	test( QueryString.encode( 5 ) === null );
	test( QueryString.encode( { a: 1, b: 2 } ) === 'a=1&b=2' );
	test( QueryString.encode( { c: 'asd', d: 'q&a' } ) === 'c=asd&d=' + querystring.escape( 'q&a' ) );
	test( QueryString.encode( { a: { aa: 1, bb: 2 }, b: 2 } ) === 'a[aa]=1&a[bb]=2&b=2' );
	test( QueryString.encode( { a: [ 1, 2 ], b: 2 } ) === 'a[0]=1&a[1]=2&b=2' );
	test( QueryString.encode( { a: [ { aa: 1 }, {bb: [ { cc: { dd: 2 } } ]} ], b: 2 } ) === 'a[0][aa]=1&a[1][bb][0][cc][dd]=2&b=2' );
} );