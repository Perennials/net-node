"use strict";

var querystring = require( 'querystring' );

class QueryString {
	constructor () {
		throw new Error( 'Abstract class can not be instantiated.' )
	}

	/**
	 * @def static function QueryString.encode ( object )
	 * @param object
	 * @return string|null
	 */
	static encode ( object ) {
		if ( !(object instanceof Object) ) {
			return null;
		}
		return _encodeObject( object );
	}
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


module.exports = QueryString;