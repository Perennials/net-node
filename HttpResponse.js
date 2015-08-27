"use strict";

var HttpHeaders = require( './HttpHeaders' );

var Snappy = null;
try { Snappy = require( 'snappy' ); }
catch ( e ) {}
var Zlib = require( 'zlib' );


function HttpResponse () {
	this._request = null;
	this._error = null;
	this._content = null;
	this._headers = null;
	this._statusCode = null;
}

HttpResponse.define( {
	setRequest: function ( request ) {
		return this._request = request;
	},

	getRequest: function () {
		return this._request;
	},

	setError: function ( error ) {
		return this._error = error;
	},

	getError: function () {
		return this._error;
	},

	isError: function () {
		return this._error !== null || this._statusCode >= 400;
	},

	setContent: function ( content ) {
		return this._content = content;
	},

	getContent: function () {
		return this._content;
	},

	isCompressed: function () {
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
	},

	getDecompressed: function ( callback ) {

		if ( !this.isCompressed() ) {
			callback( null, this._content );
			return this;
		}

		var encoding = this.getHeader( HttpHeaders.CONTENT_ENCODING );
		if ( encoding === HttpHeaders.CONTENT_ENCODING_SNAPPY ) {
			
			Snappy.decompress( this._content, callback );
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
	},

	setHeaders: function ( headers ) {
		return this._headers = headers;
	},

	getHeaders: function () {
		return this._headers;
	},

	getHeader: function ( name ) {
		var ret = this._headers instanceof Object ?
		          this._headers[ name.toLowerCase() ] :
		          undefined;

		return ret;
	},

	setStatusCode: function ( statusCode ) {
		return this._statusCode = statusCode;
	},

	getStatusCode: function () {
		return this._statusCode;
	}

} );

module.exports = HttpResponse;
