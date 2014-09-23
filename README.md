Net
===
Net classes for Node.js.

```sh
npm install https://github.com/Perennials/net-node/tarball/master
```

<!-- MarkdownTOC -->

- [HttpRequest](#httprequest)
	- [Example usage](#example-usage)
	- [Methods](#methods)
- [HttpResponse](#httpresponse)
- [QueryString](#querystring)
- [Authors](#authors)

<!-- /MarkdownTOC -->


HttpRequest
-----------

### Example usage

```js
var HttpRequest = require( 'Net/HttpRequest' );
var HttpHeaders = require( 'Net/HttpHeaders' );

var request = new HttpRequest( 'http://server.com/page?q=search' );
request.setMethod( 'POST' );
request.setHeader( HttpHeaders.CONTENT_TYPE, HttpHeaders.CONTENT_TYPE_XML );
request.send( '<xml>content</xml>', function ( response ) ) {

	if ( response.isError() ) {
		throw new Error( 'Damn!' );
	}

	response.getContent();
} );
```

### Methods

```js
new HttpRequest( url:String );
new HttpRequest();
```
Constructor.

```js
.setMethod( method:String ) : this;
.getMethod() : String;
```
Sets the HTTP method, e.g. `POST` or `GET`.


```js
.setScheme( scheme:String ) : this;
.getScheme() : String;
```
Sets the scheme part of the URL. `http` and `https` are supported.


```js
.setQuery( query:String ) : this;
.getQuery() : String;
.setQuery( { name: value, ... } ) : this;
```
Sets the query part of the URL. Should not include the question mark, e.g.
`param1=true&param2=value`. If the passed query is an Object, it will be threated
with `QueryString.encode()`.


```js
.setHost( host:String ) : this;
.getHost() : String;
```
Sets the host name. The string may include the port number, e.g.
'mysefver.com:8080'.


```js
.setHeader( name:String, value:String ) : this;
.setHeader( { name: value:String, ... } ) : this;
```
Sets one or more request headers.

```js
.getHeaders() : Object;
.getHeader( name:String ) : String|undefined;
```
Retrieves all response headers or just specific header.


```js
.setContent( content:String|Buffer|null );
.setContent( content:String|Buffer|null, encoding:String );
.getContent() : String|Buffer|null;
```
Sets the HTTP message body. `encoding` is used when converting strings to `Buffer`, defaults to `"utf8"`.


```js
.setSecurity( security:Object ) : this;
.getSecurity();
```
This sets HTTPS specific options to be passed to https.Request. Right now the format
is the same as the one accepted by node.js.


```js
.isInProgress() : Boolean;
```
Checks is the request is still in progress.


```js
.dontAutoEncode() : this;
```
Prevents `.send()` from automatically compressing the content based on the headers.


```js
.send( content:String|Buffer, encoding:String, callback:function( response:HttpResponse ) ) : this;
.send( content:String|Buffer, callback:function( response:HttpResponse ) ) : this;
.send( callback:function( response:HttpResponse ) ) : this;
```
Performs the HttpRequest. `encoding` is used when converting strings to
`Buffer`, defaults to `"utf8"`. If the headers contain `Content-Encoding` with
one of the supported encodings (snappy, gzip, deflate), the content will be
automatically encoded (overridable with `.dontAutoEncode()`). For HTTPS requests,
the default value of node's option `rejectUnauthorized` will be changed to `false`.


HttpResponse
------------

This object is passed to the callback of `HttpRequest.send()` and should not
be constructed manually.

```js
.getRequest() : HttpRequest|null;
```
Retrieves the `HttpRequest` that produced this response.

```js
.isError() : Boolean;
```
Checks if this is an error response. **Notice**: error response may be due to
HTTP response status > 400, or due to failing to perform the request at all.

```js
.getError() : Error|null;
```
Retrieves the error associated with this response.

```js
.getContent() : Buffer|null;
```
Retrives the raw HTTP content (could be compressed).

```js
.getHeaders() : Object;
.getHeader( name:String ) : String|undefined;
```
Retrieves all response headers or just specific header.

```js
.isCompressed() : Boolean;
```
Checks if the content is compressed. Throws if the compression method is not supported.

```js
.getDecompressed( callback:function( err, content:Buffer ) ) : this;
```
Decompresses the content according to the `Content-Encoding` header (if it is compressed).


QueryString
-----------

```js
static .encode( query:Object ) : String|null;
```
Encodes an object as query string, excluding the question mark. Sub-objects
and arrays are encoded in PHP `http_build_query()` style.


Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)