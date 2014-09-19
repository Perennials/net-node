"use strict";

function HttpResponse () {
	this._request = null;
	this._error = null;
	this._content = null;
	this._headers = null;
	this._statusCode = null;
}

HttpResponse.define( {
	setRequest: function ( request ) {
		return this._request = request;
	},

	getRequest: function () {
		return this._request;
	},

	setError: function ( error ) {
		return this._error = error;
	},

	getError: function () {
		return this._error;
	},

	isError: function () {
		return this._error !== null || this._statusCode >= 400;
	},

	setContent: function ( content ) {
		return this._content = content;
	},

	//todo: handle gzip, deflate, snappy, msgpack, utf8
	getContent: function () {
		return this._content;
	},

	setHeaders: function ( headers ) {
		return this._headers = headers;
	},

	getHeaders: function () {
		return this._headers;
	},

	setStatusCode: function ( statusCode ) {
		return this._statusCode = statusCode;
	},

	getStatusCode: function () {
		return this._statusCode;
	}

	//todo: toString() or direct write to a stream for logging
} );

module.exports = HttpResponse;