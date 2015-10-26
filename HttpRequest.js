"use strict";

require( 'Prototype' );

var Http = require( 'http' );
var Https = require( 'https' );
var Url = require( 'url' );
var HttpResponse = require( './HttpResponse' );
var HttpHeaders = require( './HttpHeaders' );
var IncomingMessageReader = require( './IncomingMessageReader' );

var Snappy = null;
try { Snappy = require( 'snappy' ); }
catch ( e ) {}
var Zlib = require( 'zlib' );

var _DefAcceptEncoding = (Snappy ? HttpHeaders.CONTENT_ENCODING_SNAPPY + ', ' : '') + 
                         HttpHeaders.CONTENT_ENCODING_GZIP + ', ' +
                         HttpHeaders.CONTENT_ENCODING_DEFLATE + ', ' +
                         HttpHeaders.CONTENT_ENCODING_IDENTITY;

class HttpRequest {

	constructor ( url ) {

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
		this._handle = null;
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

	getHandle () {
		return this._handle;
	}

	dontAutoEncode () {
		this._autoEncode = false;
		return this;
	}

	setOptions ( options ) {
		this._options = options;
		return this;
	}

	getOptions () {
		return this._options;
	}

	setScheme ( scheme ) {
		this._scheme = scheme;
		return this;
	}

	getScheme ( scheme ) {
		return this._scheme;
	}

	setHost ( host ) {
		this._host = host;
		return this;
	}

	getHost () {
		return this._host;
	}

	setMethod ( method ) {
		this._method = method;
		return this;
	}

	getMethod () {
		return this._method;
	}

	//todo: support for streams will be very nice, but only when needed (i.e. never)
	setContent ( content, encoding ) {
		if ( String.isString( content ) && content.length > 0 ) {
			content = new Buffer( content, encoding || 'utf8' );
		}
		this._content = content;
		if ( ( this._content instanceof Buffer ) &&
		     this._content.length > 0 ) {

			this.setHeader( HttpHeaders.CONTENT_LENGTH, this._content.length );
		}
		return this;
	}

	getContent () {
		return this._content;
	}

	setQuery ( query ) {
		this._query = query instanceof Object ? QueryString.encode( query ) : query;
		return this;
	}

	getQuery () {
		return this._query;
	}

	isInProgress () {
		return this._inProgress;
	}

	setHeader ( name, value ) {
		if ( name instanceof Object ) {
			for ( var key in name ) {
				this._headers[ key.toLowerCase() ] = name[ key ];
			}
		}
		else {
			this._headers[ name.toLowerCase() ] = value;
		}
		return this;
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

	send ( content, encoding, callback ) {

		if ( this._inProgress !== null ) {
			throw new Error( 'Reusing the same HttpRequest is not implemented.' );
		}

		this._inProgress = true;

		if ( content instanceof Function || content instanceof IncomingMessageReader ) {
			callback = content;
			encoding = undefined;
			content = undefined;
		}

		if ( encoding instanceof Function || encoding instanceof IncomingMessageReader ) {
			callback = encoding;
			encoding = undefined;
		}

		var _this = this;
		var _doSend = function ( err, content ) {

			if ( content !== undefined ) {
				_this.setContent( content, encoding );
			}

			var response;
			if ( callback instanceof Function ) {
				response = new HttpResponse();
				if ( err ) {
					response.setError( err );
				}
				response.setRequest( _this );
			}
			
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

				if ( response ) {
					response.setHandle( res );
					response.setStatusCode( res.statusCode );
					response.setHeaders( res.headers );
				}

				if ( callback instanceof IncomingMessageReader ) {
					callback.read( res );
					res.on( 'error', notify );
					res.on( 'end', notify );
				}
				else {

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
				}
			
			} );

			_this._handle = req;

			req.on( 'error', function ( err ) {
				if ( response ) {
					response.setError( err );
				}
				else if ( callback instanceof IncomingMessageReader ) {
					callback.onError( err );
				}
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

		var ctype = this.getHeader( HttpHeaders.CONTENT_TYPE );
		if ( this._autoEncode &&
		     ctype === HttpHeaders.CONTENT_TYPE_JSON &&
		     content instanceof Object
		) {
			content = JSON.stringify( content );
		}

		if ( !(content instanceof Buffer) && !String.isString( content ) ) {
			content = undefined;
		}

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
}

module.exports = HttpRequest;
