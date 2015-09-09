"use strict";


class HttpHeaders {
	constructor () {

		throw new Error( 'Can not be instantiated (yet).' );
	}
}

HttpHeaders.static( {

	CONTENT_TYPE: 'Content-Type',
	CONTENT_TYPE_FORM: 'application/x-www-form-urlencoded',
	CONTENT_TYPE_JSON: 'application/json',
	CONTENT_TYPE_XML: 'text/xml',
	CONTENT_TYPE_HTML: 'text/html',
	CONTENT_TYPE_TEXT: 'text/plain',
	CONTENT_TYPE_BINARY: 'application/octet-stream',
	ACCEPT_ENCODING: 'Accept-Encoding',
	VARY: 'Vary',
	CONTENT_LENGTH: 'Content-Length',
	CONTENT_ENCODING: 'Content-Encoding',
	CONTENT_ENCODING_IDENTITY: 'identity',
	CONTENT_ENCODING_GZIP: 'gzip',
	CONTENT_ENCODING_DEFLATE: 'deflate',
	CONTENT_ENCODING_SNAPPY: 'snappy',
	TRANSFER_ENCODING: 'Transfer-Encoding',
	TRANSFER_ENCODING_CHUNKED: 'chunked',
	TRANSFER_ENCODING_IDENTITY: 'identity',
	CONNECTION: 'Connection',
	CONNECTION_CLOSE: 'close',
	HOST: 'Host'

} );

module.exports = HttpHeaders;