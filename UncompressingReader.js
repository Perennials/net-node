"use strict";

var Snappy = null;
try { Snappy = require( 'snappy' ); }
catch ( e ) {}
var Zlib = require( 'zlib' );

var IncomingMessageReader = require( './IncomingMessageReader' );

class UncompressingReader extends IncomingMessageReader {

	constructor ( message, callback ) {

		if ( message instanceof Function ) {
			callback = message;
			message = null;
		}

		super( message );
		this._chunks = [];
		this._callback = callback;
	}

	onError ( err ) {
		super.onError( err );
		
		this._callback( err );
	}

	onData ( data ) {
		super.onData( data );
		
		this._chunks.push( data );
	}

	onEnd () {
		super.onEnd();
		
		var content = Buffer.concat( this._chunks );
		this._chunks = null;

		var encoding = this._message.headers[ 'content-encoding' ];
		var _this = this;
	
		if ( encoding === 'gzip'  ) {
			Zlib.gunzip( content, _this._callback );
		}
		else if ( encoding === 'deflate'  ) {
			Zlib.inflate( content, _this._callback );
		}
		else if ( encoding === 'snappy' && Snappy ) {
			Snappy.decompress( content, _this._callback );
		}
		else {
			_this._callback( null, content );
		}

	}

}

module.exports = UncompressingReader;