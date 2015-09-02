Net
===
Net classes for Node.js. This module saves the tedious work of all the event
handling in node.js to send a simple HTTP request and also helps with taking
care of the compressed content of the response.

```sh
npm install https://github.com/Perennials/net-node/tarball/master
```

<!-- MarkdownTOC -->

- [HttpRequest](#httprequest)
	- [Example usage](#example-usage)
	- [Methods](#methods)
		- [Constructor](#constructor)
		- [.setMethod() / .getMethod()](#setmethod--getmethod)
		- [.setScheme() / .getScheme()](#setscheme--getscheme)
		- [.setQuery() / .getQuery()](#setquery--getquery)
		- [.setHost() / .getHost()](#sethost--gethost)
		- [.setHeader() / .getHeader()](#setheader--getheader)
		- [.getHeaders() / .getHeader()](#getheaders--getheader)
		- [.setContent() / .getContent()](#setcontent--getcontent)
		- [.setOptions() / .getOptions()](#setoptions--getoptions)
		- [.isInProgress()](#isinprogress)
		- [.dontAutoEncode()](#dontautoencode)
		- [.send()](#send)
- [HttpResponse](#httpresponse)
	- [Methods](#methods-1)
		- [.getRequest()](#getrequest)
		- [.isError()](#iserror)
		- [.getError()](#geterror)
		- [.getContent()](#getcontent)
		- [.getHeaders() / .getHeader()](#getheaders--getheader-1)
		- [.isCompressed()](#iscompressed)
		- [.getDecompressed()](#getdecompressed)
- [QueryString](#querystring)
	- [Methods](#methods-2)
		- [QueryString.encode()](#querystringencode)
- [Authors](#authors)

<!-- /MarkdownTOC -->


HttpRequest
-----------
Represents a HTTP client request.

```js
var HttpRequest = require( 'Net/HttpRequest' );
```

### Example usage

```js
var HttpRequest = require( 'Net/HttpRequest' );
var HttpHeaders = require( 'Net/HttpHeaders' );

var request = new HttpRequest( 'http://server.com/page?q=search' );
request.setMethod( 'POST' );
request.setHeader( HttpHeaders.CONTENT_TYPE, HttpHeaders.CONTENT_TYPE_XML );
request.send( '<xml>content</xml>', function ( response ) {

	if ( response.isError() ) {
		throw new Error( 'Damn!' );
	}

	response.getContent();
} );
```

### Methods

- [Constructor](#constructor)
- [.setMethod() / .getMethod()](#setmethod--getmethod)
- [.setScheme() / .getScheme()](#setscheme--getscheme)
- [.setQuery() / .getQuery()](#setquery--getquery)
- [.setHost() / .getHost()](#sethost--gethost)
- [.setHeader() / .getHeader()](#setheader--getheader)
- [.getHeaders() / .getHeader()](#getheaders--getheader)
- [.setContent() / .getContent()](#setcontent--getcontent)
- [.setOptions() / .getOptions()](#setoptions--getoptions)
- [.isInProgress()](#isinprogress)
- [.dontAutoEncode()](#dontautoencode)
- [.send()](#send)

#### Constructor
Constructor.

```js
new HttpRequest(
	url:String
);

new HttpRequest();
```


#### .setMethod() / .getMethod()
Sets the HTTP method, e.g. `POST` or `GET`.

```js
.setMethod(
	method:String
) : this;

.getMethod() : String;
```


#### .setScheme() / .getScheme()
Sets the scheme part of the URL. `http` and `https` are supported.

```js
.setScheme(
	scheme:String
) : this;

.getScheme() : String;
```


#### .setQuery() / .getQuery()
Sets the query part of the URL. Should not include the question mark, e.g.
`param1=true&param2=value`. If the passed query is an Object, it will be threated
with `QueryString.encode()`.

```js
.setQuery(
	query:String
) : this;

.setQuery(
	{ name: value, ... }
) : this;

.getQuery() : String;
```


#### .setHost() / .getHost()
Sets the host name. The string may include the port number, e.g.
'mysefver.com:8080'.

```js
.setHost(
	host:String
) : this;

.getHost() : String;
```


#### .setHeader() / .getHeader()
Sets one or more request headers.

```js
.setHeader(
	name:String,
	value:String
) : this;

.setHeader(
	{ name: value:String, ... }
) : this;
```


#### .getHeaders() / .getHeader()
Retrieves all response headers or just specific header.

```js
.getHeaders() : Object;

.getHeader(
	name:String
) : String|undefined;
```


#### .setContent() / .getContent()
Sets the HTTP message body. `encoding` is used when converting strings to `Buffer`, defaults to `"utf8"`.

```js
.setContent(
	content:String|Buffer|null
);

.setContent(
	content:String|Buffer|null,
	encoding:String
);

.getContent() : String|Buffer|null;
```


#### .setOptions() / .getOptions()
Sets additional options to be passed to node's `http.request()` or
`https.request()`. Right now the format is the same as the one accepted by
node.js.

```js
.setOptions(
	options:Object
) : this;

.getOptions();
```


#### .isInProgress()
Checks if the request is still in progress.

```js
.isInProgress() : Boolean;
```


#### .dontAutoEncode()
Prevents `.send()` from automatically compressing the content based on the headers.

```js
.dontAutoEncode() : this;
```


#### .send()
Performs the HttpRequest. `encoding` is used when converting strings to
`Buffer`, defaults to `"utf8"`. If the headers contain `Content-Encoding` with
one of the supported encodings (snappy, gzip, deflate), the content will be
automatically encoded (overridable with `.dontAutoEncode()`). For HTTPS requests,
the default value of node's option `rejectUnauthorized` will be changed to `false`.

```js
.send(
	content:String|Buffer,
	encoding:String,
	callback:function( response:HttpResponse )|undefined
) : this;

.send(
	content:String|Buffer,
	callback:function( response:HttpResponse )|undefined 
) : this;

.send(
	callback:function( response:HttpResponse )|undefined
) : this;
```


HttpResponse
------------

This object is passed to the callback of `HttpRequest.send()` and should not
be constructed manually.

### Methods

- [.getRequest()](#getrequest)
- [.isError()](#iserror)
- [.getError()](#geterror)
- [.getContent()](#getcontent)
- [.getHeaders() / .getHeader()](#getheaders--getheader-1)
- [.isCompressed()](#iscompressed)
- [.getDecompressed()](#getdecompressed)

#### .getRequest()
Retrieves the `HttpRequest` that produced this response.

```js
.getRequest() : HttpRequest|null;
```


#### .isError()
Checks if this is an error response. **Notice**: error response may be due to
HTTP response status > 400, or due to failing to perform the request at all.

```js
.isError() : Boolean;
```


#### .getError()
Retrieves the error associated with this response.

```js
.getError() : Error|null;
```


#### .getContent()
Retrives the raw HTTP content (could be compressed).

```js
.getContent() : Buffer|null;
```


#### .getHeaders() / .getHeader()
Retrieves all response headers or just specific header.

```js
.getHeaders() : Object;

.getHeader(
	name:String
) : String|undefined;
```


#### .isCompressed()
Checks if the content is compressed. Throws if the compression method is not supported.

```js
.isCompressed() : Boolean;
```


#### .getDecompressed()
Decompresses the content according to the `Content-Encoding` header (if it is compressed).

```js
.getDecompressed(
	callback:function( err, content:Buffer )
) : this;
```


QueryString
-----------

### Methods

- [QueryString.encode()](#querystringencode)

#### QueryString.encode()
Encodes an object as query string, excluding the question mark. Sub-objects
and arrays are encoded in PHP `http_build_query()` style.

```js
QueryString.encode(
	query:Object
) : String|null;
```


Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)
