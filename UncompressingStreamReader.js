"use strict";

var SnappyStream = null;
try { SnappyStream = require( 'snappy-stream' ); }
catch ( e ) {}
var Zlib = require( 'zlib' );

var IncomingMessageReader = require( './IncomingMessageReader' );

class UncompressingStreamReader extends IncomingMessageReader {

	constructor ( message ) {
		super( message );
		this._uncompress = null;
	}

	read ( message ) {

		super.read( message );

		var encoding = message.headers[ 'content-encoding' ];
	
		if ( encoding === 'gzip'  ) {
			this._uncompress = Zlib.createGunzip();
		}
		else if ( encoding === 'deflate'  ) {
			this._uncompress = Zlib.createInflate();
		}
		else if ( encoding === 'snappy' && SnappyStream ) {
			this._uncompress = SnappyStream.createUncompressStream();
		}
		else {
			this._uncompress = null;
		}

		var uncompress = this._uncompress;
		if ( !uncompress ) {
			return;
		}

		message.removeListener( 'data', this._onData );
		message.removeListener( 'end', this._onEnd );
		message.on( 'data', uncompress.write.bind( uncompress ) );
		message.on( 'end', uncompress.end.bind( uncompress ) );
		
		uncompress.on( 'error', this._onError );
		uncompress.on( 'data', this._onData );
		uncompress.on( 'finish', this._onEnd );
	}

}

module.exports = UncompressingStreamReader;