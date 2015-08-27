"use strict";

require( 'Prototype' );

var Http = require( 'http' );
var Https = require( 'https' );
var Url = require( 'url' );
var HttpResponse = require( './HttpResponse.js' );
var HttpHeaders = require( './HttpHeaders.js' );

var Snappy = null;
try { Snappy = require( 'snappy' ); }
catch ( e ) {}
var Zlib = require( 'zlib' );

var _DefAcceptEncoding = (Snappy ? HttpHeaders.CONTENT_ENCODING_SNAPPY + ', ' : '') + 
                         HttpHeaders.CONTENT_ENCODING_GZIP + ', ' +
                         HttpHeaders.CONTENT_ENCODING_DEFLATE + ', ' +
                         HttpHeaders.CONTENT_ENCODING_IDENTITY;

function HttpRequest ( url ) {

	this._inProgress = null;
	this._autoEncode = true;
	this._method = 'GET';
	this._scheme = 'http';
	this._host = null;
	this._path = null;
	this._query = null;
	this._auth = null;
	this._content = null;
	this._headers = {};
	this._options = null;
	this.setHeader( HttpHeaders.CONNECTION, HttpHeaders.CONNECTION_CLOSE );
	this.setHeader( HttpHeaders.ACCEPT_ENCODING, _DefAcceptEncoding );

	if ( String.isString( url ) && url.length > 0 ) {
		var url = Url.parse( url );
		if ( url.protocol ) {
			this._scheme = url.protocol.splitFirst( ':' ).left;
		}
		if ( url.path ) {
			this._path = url.pathname;
		}
		if ( url.hostname ) {
			this._host = url.hostname + ( url.port ? ':' + url.port : '' );
		}
		if ( url.auth ) {
			this._auth = url.auth;
		}
		if ( url.search ) {
			this._query = url.search.substr( 1 );
		}

	}
}

HttpRequest.define( {

	dontAutoEncode: function () {
		this._autoEncode = false;
		return this;
	},

	setOptions: function ( options ) {
		this._options = options;
		return this;
	},

	getOptions: function () {
		return this._options;
	},

	setScheme: function ( scheme ) {
		this._scheme = scheme;
		return this;
	},

	getScheme: function ( scheme ) {
		return this._scheme;
	},

	setHost: function ( host ) {
		this._host = host;
		return this;
	},

	getHost: function () {
		return this._host;
	},

	setMethod: function ( method ) {
		this._method = method;
		return this;
	},

	getMethod: function () {
		return this._method;
	},

	//todo: support for streams will be very nice, but only when needed (i.e. never)
	setContent: function ( content, encoding ) {
		if ( String.isString( content ) && content.length > 0 ) {
			content = new Buffer( content, encoding || 'utf8' );
		}
		this._content = content;
		if ( ( this._content instanceof Buffer ) &&
		     this._content.length > 0 ) {

			this.setHeader( HttpHeaders.CONTENT_LENGTH, this._content.length );
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	setQuery: function ( query ) {
		this._query = query instanceof Object ? QueryString.encode( query ) : query;
		return this;
	},

	getQuery: function () {
		return this._query;
	},

	isInProgress: function () {
		return this._inProgress;
	},

	setHeader: function ( name, value ) {
		if ( name instanceof Object ) {
			for ( var key in name ) {
				this._headers[ key.toLowerCase() ] = name[ key ];
			}
		}
		else {
			this._headers[ name.toLowerCase() ] = value;
		}
		return this;
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

	//todo: support for output sink would be very nice, but only when needed (i.e. never)
	send: function ( content, encoding ) {

		if ( this._inProgress !== null ) {
			throw new Error( 'Reusing the same HttpRequest is not implemented.' );
		}

		this._inProgress = true;


		if ( !(content instanceof Buffer) && !String.isString( content ) ) {
			content = undefined;
		}

		if ( !String.isString( encoding ) ) {
			encoding = undefined;
		}

		var callback = arguments[ arguments.length - 1 ];
		if ( !(callback instanceof Function) ) {
			callback = null;
		}

		var _this = this;
		var _doSend = function ( err, content ) {

			if ( content !== undefined ) {
				_this.setContent( content, encoding );
			}

			var response = new HttpResponse();
			if ( err ) {
				response.setError( err );
			}
			response.setRequest( _this );
			
			var notify = function () {
				if ( _this._inProgress !== true ) {
					return;
				}

				_this._inProgress = false;
				if ( callback instanceof Function ) {
					callback( response );
				}
			};

			if ( err ) {
				notify();
				return;
			}


			var hostport = (_this._host||'').splitFirst( ':' );
			var req = {
				method: _this._method,
				hostname: hostport.left,
				port: parseInt( hostport.right ) || 80,
				auth: _this._auth,
				path: _this._path + ( _this._query ? '?' + _this._query : '' ),
				headers: _this._headers,
				rejectUnauthorized: false
			};

			var Scheme = Http;
			if ( _this.scheme === 'https' ) {
				Scheme = Https;
			}

			if ( _this._options instanceof Object ) {
				req.merge( _this._options );
			}

			req = Scheme.request( req, function ( res ) {

				response.setStatusCode( res.statusCode );
				response.setHeaders( res.headers );

				res.on( 'error', function ( err ) {
					response.setError( err );
					notify();
					req.abort();
				} );

				var chunks = [];
				res.on( 'data', function( chunk ) {
					chunks.push( chunk );
				} );

				res.on( 'end', function () {
					response.setContent( Buffer.concat( chunks ) );
					chunks = null;
					notify();
				} );
			
			} );

			// what if we receive the response callback before the error handler is registered, dumb node
			// lets hope the request is not started before the next tick
			req.on( 'error', function ( err ) {
				response.setError( err );
				notify();
				req.abort();
			} );

			if ( _this._content instanceof Buffer && _this._content.length > 0 ) {
				req.end( _this._content );
			}
			else {
				req.end();
			}
		};

		var cencoding = this.getHeader( HttpHeaders.CONTENT_ENCODING );
		if ( this._autoEncode && 
		     ( cencoding === HttpHeaders.CONTENT_ENCODING_SNAPPY || 
		       cencoding === HttpHeaders.CONTENT_ENCODING_GZIP ||
		       cencoding === HttpHeaders.CONTENT_ENCODING_DEFLATE ) ) {
			
			if ( cencoding === HttpHeaders.CONTENT_ENCODING_SNAPPY ) {
				Snappy.compress( content, _doSend );
			}
			else {
				Zlib[ cencoding ]( content, _doSend );
			}
		}
		else {
			_doSend( null, content );
		}

		return this;
	}

} );

module.exports = HttpRequest;
