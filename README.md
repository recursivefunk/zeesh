
```javascript

  var fs = require( 'fs' );
  var zmq = require( 'zmq' );
  var sock = zmq.socket( 'push' );
  var Zeesh = require( 'zeesh' );
  var z = new Zeesh();
  // ZeroMQ connection
  var opts = {
    host: '127.0.0.1',
    port: 3000
  };

  z.on('ready', function(){
    var stream = z.stream();
    stream.pipe( fs.createWriteStream( './foo.txt' ) );

    // send data to be streamed
    sock.bindSync( 'tcp://' + opts.host + ':' + opts.port );
    sock.send( 'foo 0\n' );
    sock.send( 'foo 1\n' );

    var file = fs.readFileSync( './foo.txt' ).toString();
    console.log( file );

    /*
      foo 0
      foo 1
     */
  })
  .connect();

```

To run tests
```
  npm test
```