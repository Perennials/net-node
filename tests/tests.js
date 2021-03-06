"use strict";

require( 'Unitest' ).enable();

if ( process.argv[2] == 'nocolor' ) {
	Unitest.noColor();
}

require( './HttpRequest.js' );
require( './QueryString.js' );
require( './AcceptEncoding.js' );