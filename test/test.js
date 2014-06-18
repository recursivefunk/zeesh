/*global describe:false, it:false, before: false*/

'use strict';

var should = require( 'should' );
var _ = require( 'highland' );
var fs = require( 'fs' );
var fs2 = require( 'fs-extra' );
var zmq = require( 'zmq' );
var ZStream = require( '../index' );

describe('ZStream', function(){

  var z;
  var tmpFile = './foo.txt';
  var opts = {
    host: '127.0.0.1',
    port: 3000
  };

  it('works', function(done){

    z = new ZStream( opts );

    z.on('ready', function(){
      var stream = z.stream();
      var start = 0;
      var stop = 5;
      var count = start;
      var interval;
      var receiver = _();
      var sock = zmq.socket( 'push' );

      stream.pipe( fs.createWriteStream( tmpFile) );

      sock.bindSync( 'tcp://' + opts.host + ':' + opts.port );

      interval = setInterval(function(){
        if ( count >= stop ) {
          clearInterval( interval );
          wrapItUp();
        } else {
          sock.send( 'foo '+ count + '\n' );
          count += 1;
        }
      }, 100);

      function wrapItUp(){
        var buff = fs.readFileSync( tmpFile );
        var lines = buff.toString().split( '\n' );
        var lastItem = lines[ lines.length - 1 ];
        lastItem.should.equal( '' );
        lines.pop();
        lines.length.should.equal( stop );
        fs2.removeSync( tmpFile );
        done();
      }

    })

    .connect();

  });


});