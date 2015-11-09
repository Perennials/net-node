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
		- [.getHandle()](#gethandle)
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
		- [.getHandle()](#gethandle-1)
		- [.isError()](#iserror)
		- [.getError()](#geterror)
		- [.getContent()](#getcontent)
		- [.getHeaders() / .getHeader()](#getheaders--getheader-1)
		- [.isCompressed()](#iscompressed)
		- [.getDecompressed()](#getdecompressed)
- [IncomingMessageReader](#incomingmessagereader)
	- [Methods](#methods-2)
		- [Constructor](#constructor-1)
		- [.read()](#read)
		- [.onData()](#ondata)
		- [.onError()](#onerror)
		- [.onEnd()](#onend)
- [UncompressingReader](#uncompressingreader)
	- [Methods](#methods-3)
		- [Constructor](#constructor-2)
- [UncompressingStreamReader](#uncompressingstreamreader)
	- [Methods](#methods-4)
		- [Constructor](#constructor-3)
- [QueryString](#querystring)
	- [Methods](#methods-5)
		- [QueryString.encode()](#querystringencode)
- [AcceptEncoding](#acceptencoding)
	- [Methods](#methods-6)
		- [Constructor](#constructor-4)
		- [.accepts()](#accepts)
		- [.getPreferred()](#getpreferred)
		- [.isPreferred()](#ispreferred)
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
- [.getHandle()](#gethandle)
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

#### .getHandle()
Retrieves the underlaying nodejs ClientRequest. This will be available only
after `.send()`.

```js
.getHandle() : http.ClientRequest|null;
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
`Buffer`, defaults to `"utf8"`.

If the `content` is `Object` and the headers has `Content-Type: application/json`,
the content will be strinigfied as JSON.

If the headers contain `Content-Encoding` with one of the supported encodings
(snappy, gzip, deflate), the content will be automatically encoded
(overridable with `.dontAutoEncode()`). For HTTPS requests, the default value
of node's option `rejectUnauthorized` will be changed to `false`.

The callback is either a function that will receive the full response or a "sink".
A sink (a class derived from `IncomingMessageReader`) will receive the raw node
http.IncomingMessage and can process it incrementally.

```js
.send(
	content:String|Buffer|Object,
	encoding:String,
	callback:function( response:HttpResponse )|IncomingMessageReader|undefined
) : this;

.send(
	content:String|Buffer|Object,
	callback:function( response:HttpResponse )|IncomingMessageReader|undefined 
) : this;

.send(
	callback:function( response:HttpResponse )|IncomingMessageReader|undefined
) : this;
```


HttpResponse
------------

This object is passed to the callback of `HttpRequest.send()` and should not
be constructed manually.

### Methods

- [.getRequest()](#getrequest)
- [.getHandle()](#gethanle-1)
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

#### .getHandle()
Retrieves the underlaying nodejs IncomingMessage.

```js
.getHandle() : http.IncomingMessage|null;
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


IncomingMessageReader
---------------------
An object of this class can act a sink for HTTP responses. This is only the base class.
The base class will hook the `data`, `error` and `end` events of the HTTP response and
will call `.onData()`, `.onError()` and `.onEnd()` accordingly.

```js
var IncomingMessageReader = require( 'Net/IncomingMessageReader' );
```

### Methods

- [Constructor](#constructor-1)
- [.read()](#read)
- [.onData()](#ondata)
- [.onError()](#onerror)
- [.onEnd()](#onend)

#### Constructor
This function will invoke `.read()` if a `message` is given.

```js
new IncomingMessageReader(
	message:http.IncomingMessage|undefined
);
```

#### .read()
This function will actually rig the event handlers on the HTTP response.
It will be optionally ivoked by the constructor if a message parameter is given.

The event listeners registered by this function will be stored in `._onData`,
`._onError` and `._onEnd`, these properties should be treated as protected and
can be modified by the derived classes.

```js
.read(
	message:http.IncomingMessage
);
```

#### .onData()
Called on `data` event on the HTTP response. This function will also emit
`data` event for the object itself. Derived classes can override this
function, but should call the super function, so the event emitting
functionality will remain in tact.

```js
.onData(
	chunk:Buffer
);
```

#### .onError()
Called on `error` event on the HTTP response or on the HTTP request. This
function will also emit `error` event for the object itself. Derived classes
can override this function, but should call the super function, so the event
emitting functionality will remain in tact.

```js
.onError(
	error:Error
);
```

#### .onEnd()
Called on `end` event on the HTTP response. This function will also emit `end`
event for the object itself. Derived classes can override this function, but
should call the super function, so the event emitting functionality will
remain in tact.

```js
.onEnd();
```

UncompressingReader
-------------------

Extends [`IncomingMessageReader`](#incomingmessagereader). This class will read
the whole response in a buffer, optionally uncompress it and pass the result the
provided callback.

```js
var UncompressingReader = require( 'Net/UncompressingReader' );
```

### Methods

#### Constructor

```js
new UncompressingReader(
	message:http.IncomingMessage,
	callback:function( err:Error|null, content:Buffer|null )
);
```

```js
new UncompressingReader(
	callback:function( err:Error|null, content:Buffer|null )
);
```

UncompressingStreamReader
-------------------------

Extends [`IncomingMessageReader`](#incomingmessagereader). This class will read
and uncompress the response incrementally. The `.onData()` handler will receive
uncompressed chunks. One can either extend the class and override `.onData()` or
handle the `data` event.

```js
var UncompressingStreamReader = require( 'Net/UncompressingStreamReader' );
```

### Methods

#### Constructor

```js
new UncompressingStreamReader(
	message:http.IncomingMessage|undefined
);
```


QueryString
-----------
Utility class for encoding URL strings.

```js
var QueryString = require( 'Net/QueryString' );
```

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


AcceptEncoding
--------------
Utility class for parsing `accept-encoding` header according to the HTTP/1.1 specs.

```js
var AcceptEncoding = require( 'Net/AcceptEncoding' );
```

### Methods

- [Constructor](#constructor-4)
- [.accepts()](#accepts)
- [.getPreferred()](#getpreferred)
- [.isPreferred()](#ispreferred)

#### Constructor
Accepts one parameter - the value of the `accept-ecoding` HTTP header.

```js
new AcceptEncoding(
	accepts:String|undefined
);
```

#### .accepts()
Determines if some ecoding type should be accepted.

```js
.accepts(
	type:String
) : Boolean;
```

#### .getPreferred()
Retrieves the most preferred encoding type. May return `*`.

```js
.getPreferred() : String;
```

#### .isPreferred()
Check if the supplied type is preferred. This function is provided
to avoid taking care of the `*` case manually.

```js
.isPreferred(
	type:String
) : Boolean;
```

Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)
