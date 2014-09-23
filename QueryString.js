"use strict";

var querystring = require( 'querystring' );

function QueryString () {
	throw new Error( 'Abstract class can not be instantiated.' )
}

//private
function _encodePrimitive( val ) {
	if ( typeof val == 'number' || val instanceof Number ) {
		val = String( val );
	}
	return querystring.escape( val );
}

//private
function _encodeArray ( array, namePrefix ) {
	var ret = '';
	for ( var i = 0, iend = array.length; i < iend; ++i ) {
		var name = namePrefix + '[' + i + ']';
		var val = array[i];
		if ( val instanceof Array ) {
			val = _encodeArray( val, name );
			ret += ( ret.length > 0 ? '&' : '' ) + val;
		}
		else if ( val instanceof Object ) {
			val = _encodeObject( val, name );
			ret += ( ret.length > 0 ? '&' : '' ) + val;
		}
		else {
			val = _encodePrimitive( val );
			ret += ( ret.length > 0 ? '&' : '' ) + name + '=' + val;
		}
	}
	return ret;
}

//private
function _encodeObject ( object, namePrefix ) {
	var ret = '';
	for ( var i in object ) {
		var name = namePrefix ? namePrefix + '[' + querystring.escape( i ) + ']' : querystring.escape( i );
		var val = object[i];
		if ( val instanceof Array ) {
			val = _encodeArray( val, name );
			ret += ( ret.length > 0 ? '&' : '' ) + val;
		}
		else if ( val instanceof Object ) {
			val = _encodeObject( val, name );
			ret += ( ret.length > 0 ? '&' : '' ) + val;
		}
		else {
			val = _encodePrimitive( val );
			ret += ( ret.length > 0 ? '&' : '' ) + name + '=' + val;
		}
		
	}
	return ret;
}

QueryString.defineStatic( {
	/**
	 * @def static function QueryString.encode ( object )
	 * @param object
	 * @return string|null
	 */
	encode: function ( object ) {
		if ( !(object instanceof Object) ) {
			return null;
		}
		return _encodeObject( object );
		
	}
} );

module.exports = QueryString;