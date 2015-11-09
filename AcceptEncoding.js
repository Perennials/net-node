"use strict";

require( 'Prototype' );

class AcceptEncoding {
	constructor ( accepts ) {
		var accept = [];
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
			if ( q > 0 ) {
				accept.push( { value: it.left.trim(), q: q } );
			}
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
			if ( val == '*' || val == type ) {
				return true;
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