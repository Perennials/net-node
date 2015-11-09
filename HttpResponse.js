"use strict";

var HttpHeaders = require( './HttpHeaders' );

var Snappy = null;
try { Snappy = require( 'snappy' ); }
catch ( e ) {}
var Zlib = require( 'zlib' );


class HttpResponse {

	constructor () {
		this._request = null;
		this._error = null;
		this._content = null;
		this._headers = null;
		this._statusCode = null;
		this._handle = null;
	}

	setHandle ( handle ) {
		return this._handle = handle;
	}

	getHandle () {
		return this._handle;
	}
	
	setRequest ( request ) {
		return this._request = request;
	}

	getRequest () {
		return this._request;
	}

	setError ( error ) {
		return this._error = error;
	}

	getError () {
		return this._error;
	}

	isError () {
		return this._error !== null || this._statusCode >= 400;
	}

	setContent ( content ) {
		return this._content = content;
	}

	getContent () {
		return this._content;
	}

	isCompressed () {
		var encoding = this.getHeader( HttpHeaders.CONTENT_ENCODING );
		
		if ( encoding === HttpHeaders.CONTENT_ENCODING_IDENTITY ) {
			return false;
		}
		else if ( encoding === HttpHeaders.CONTENT_ENCODING_GZIP ||
		          encoding === HttpHeaders.CONTENT_ENCODING_DEFLATE ) {
			
			return true;
		}
		else if ( encoding === HttpHeaders.CONTENT_ENCODING_SNAPPY && Snappy ) {
			return true;
		}

		if ( String.isString( encoding ) && encoding.length > 0 ) {
			throw new Error( 'Unsupported encoding.' );
		}

		return false;
	}

	getDecompressed ( callback ) {

		if ( !this.isCompressed() ) {
			callback( null, this._content );
			return this;
		}

		var encoding = this.getHeader( HttpHeaders.CONTENT_ENCODING );
		if ( Snappy && encoding === HttpHeaders.CONTENT_ENCODING_SNAPPY ) {
			
			Snappy.uncompress( this._content, callback );
			return this;
		}
		else if ( encoding === HttpHeaders.CONTENT_ENCODING_GZIP ) {
			
			Zlib.gunzip( this._content, callback );
			return this;
		}
		else if ( encoding === HttpHeaders.CONTENT_ENCODING_DEFLATE ) {
			
			Zlib.inflate( this._content, callback );
			return this;
		}

		throw new Error( 'Should never get here.' );
	}

	setHeaders ( headers ) {
		return this._headers = headers;
	}

	getHeaders () {
		return this._headers;
	}

	getHeader ( name ) {
		var ret = this._headers instanceof Object ?
		          this._headers[ name.toLowerCase() ] :
		          undefined;

		return ret;
	}

	setStatusCode ( statusCode ) {
		return this._statusCode = statusCode;
	}

	getStatusCode () {
		return this._statusCode;
	}	

}

module.exports = HttpResponse;
