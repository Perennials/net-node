"use strict";

var Events = require( 'events' );

class IncomingMessageReader extends Events.EventEmitter {

	constructor ( message ) {
		super();
		this._message = null;
		this._onData = this.onData.bind( this );
		this._onError = this.onError.bind( this );
		this._onEnd = this.onEnd.bind( this );
		if ( message ) {
			this.read( message );
		}
	}

	read ( message ) {
		this._message = message;
		message.on( 'data', this._onData );
		message.on( 'error', this._onError );
		message.on( 'end', this._onEnd );	
	}

	onError ( err ) {
		this.emit( 'error', err );
	}

	onData ( data ) {
		this.emit( 'data', data );
	}

	onEnd () {
		this.emit( 'end' );
	}

	getMessage () {
		return this._message;
	}

}

module.exports = IncomingMessageReader;