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
.setQuery( query:String ) : this;
.getQuery() : String;
//todo:
// .setQuery( { name: value, ... } ) : this;
```
Sets the query part of the URL. Should not include the question mark, e.g.
`param1=true&param2=value`.

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
.setContent( content:String|Buffer|null );
.getContent() : String|Buffer|null;
```
Sets the HTTP message body.

```js
.isInProgress() : Boolean;
```
Checks is the request is still in progress.

```js
.send( content:String|Buffer, callback:function( response:HttpResponse ) ) : this;
.send( callback:function( response:HttpResponse ) ) : this;
```
Performs the HttpRequest.


HttpResponse
-----------

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
//todo:
// .isCompressed() : Boolean;
// .getDecompressed( callback:function( Buffer ) ) : this;
```


Authors
-------
Borislav Peev (borislav.asdf at gmail dot com)