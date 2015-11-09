"use strict";

require( 'Prototype' );

class AcceptEncoding {
	constructor ( accepts ) {
		var accept = [];
		var doesntAcceptIdentity = false;
		var acceptsIdentity = false;
		var doesntAcceptAll = false;
		for ( var it of (accepts||'identity').split( ',' ) ) {
			it = it.splitLast( ';' );
			var q = 1;
			if ( it.right ) {
				q = it.right.splitLast( '=' ).right;
				if ( q ) {
					q = parseFloat( q.trim() );
				}
				else {
					q = 0;
				}
			}
			it = { value: it.left.trim(), q: q };
			if ( it.value == 'identity' ) {
				if ( q == 0 ) {
					doesntAcceptIdentity = true;
				}
				else {
					acceptsIdentity = true;
				}
			}
			else if ( q == 0 && it.value == '*' ) {
				doesntAcceptAll = true;
			}
			accept.push( it );
		}
		
		// if identity is not given and not explicitly forbiden allow it
		if ( !acceptsIdentity && !doesntAcceptIdentity && !doesntAcceptAll ) {
			accept.push( { value: 'identity', q: 1 } );
		}

		this._accepts = accept.sort( ( a, b ) => {
			if ( a.q < b.q ) {
				return 1;
			}
			else if ( a.q > b.q ) {
				return -1;
			}
			return 0;
		} );

	}

	accepts ( type ) {
		for ( var accept of this._accepts ) {
			var val = accept.value;
			if ( val == type || val == '*' ) {
				return accept.q > 0;
			}
		}
		return false;
	}

	isPreferred ( type ) {
		var preferred = this.getPreferred();
		return preferred == '*' || preferred == type;
	}

	getPreferred () {
		var ret = this._accepts[ 0 ];
		if ( ret ) {
			return ret.value;
		}
		return null;
	}
}

module.exports = AcceptEncoding;