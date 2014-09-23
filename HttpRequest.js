"use strict";

require( 'Prototype' );

var Http = require( 'http' );
var Url = require( 'url' );
var HttpResponse = require( './HttpResponse.js' );

function HttpRequest ( url ) {

	this._inprogress = null;
	this._method = 'GET';
	this._host = null;
	this._path = null;
	this._query = null;
	this._auth = null;
	this._content = null;
	this._headers = {};
	this.setHeader( {
		'Connection': 'close',
		//todo: snappy, msgpack
		'Accept-Encoding': 'gzip, deflate, identity'
	} );

	if ( String.isString( url ) && url.length > 0 ) {
		var url = Url.parse( url );
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
	setContent: function ( content ) {
		this._content = content;
		if ( ( this._content instanceof Buffer || String.isString( this._content ) ) &&
		     this._content.length > 0 ) {

			this.setHeader( 'Content-Length', this._content.length );
		}
		return this;
	},

	getContent: function () {
		return this._content;
	},

	//todo: support objects with {names: values}
	setQuery: function ( query ) {
		this._query = query;
		return this;
	},

	getQuery: function () {
		return this._query;
	},

	isInProgress: function () {
		return this._inprogress;
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

	//todo: support for output sink would be very nice, but only when needed (i.e. never)

	send: function ( content, callback ) {

		if ( this._inprogress !== null ) {
			throw new Error( 'Reusing the same HttpRequest is not implemented.' );
		}

		this._inprogress = true;

		if ( arguments.length === 1 && arguments[ 0 ] instanceof Function ) {
			callback = content;
			content = undefined;
		}

		if ( content !== undefined ) {
			this.setContent( content );
		}


		var response = new HttpResponse();
		response.setRequest( this );
		
		var _this = this;
		var notify = function () {
			if ( _this._inprogress !== true ) {
				return;
			}

			_this._inprogress = false;
			if ( callback instanceof Function ) {
				callback( response );
			}
		};


		var hostport = (this._host||'').splitFirst( ':' );

		var req = Http.request( {
			method: this._method,
			hostname: hostport.left,
			port: parseInt( hostport.right ) || 80,
			auth: this._auth,
			path: this._path + ( this._query ? '?' + this._query : '' ),
			headers: this._headers
		}, function ( res ) {

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
				notify();
			} );
		
		} );

		//what if we receive the response callback before the error handler is registered, dumb node
		//lets hope the request is not started before the next tick
		req.on( 'error', function ( err ) {
			response.setError( err );
			notify();
			req.abort();
		} );

		if ( ( this._content instanceof Buffer || String.isString( this._content ) ) &&
		     this._content.length > 0 ) {
			req.end( this._content );
		}
		else {
			req.end();
		}

		return this;
	}

	//todo: toString() or direct write to a stream for logging
} )

module.exports = HttpRequest;