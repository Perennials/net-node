var Http = require( 'http' );

var DummyServer = {
	defPort: 9090,
	defHeaders: {
		'Connection': 'close'
	},

	serveOnce: function ( response, callback, port, host ) {
	
		var server = Http.createServer( function ( req, res ) {

			res.writeHead( response.statusCode || 200,
			               {}.merge( DummyServer.defHeaders ).merge( response.headers || {} ) );

			if ( response.content === undefined ) {
				req.on( 'data', function ( chunk ) { res.write( chunk ); } );
			}
			req.on( 'end', function () {
				res.end();
				server.close();
			} );
		
		} );
		server.listen( port || DummyServer.defPort, host || '127.0.0.1', callback );
	}

};

module.exports = DummyServer;