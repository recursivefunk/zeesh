/*global describe:false, it:false, before: false*/

'use strict';

var should = require( 'should' );
var _ = require( 'highland' );
var fs = require( 'fs' );
var fs2 = require( 'fs-extra' );
var zmq = require( 'zmq' );
var sock = zmq.socket( 'push' );
var Zeesh = require( '../index' );

describe('Zeesh', function(){

  var z = new Zeesh();
  var tmpFile = './foo.txt';
  var opts = {
    host: '127.0.0.1',
    port: 3000
  };

  before(function(){
    sock.bindSync( 'tcp://' + opts.host + ':' + opts.port );
  });


  it('works with file streams', function(done){

    function onReady(){
      var stream = z.stream();
      var start = 0;
      var stop = 5;
      var count = start;
      var interval;
      var receiver = _();

      stream.pipe( fs.createWriteStream( tmpFile ) );

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
        lines.forEach(function(item){
          item.should.startWith( 'foo ' );
        });
        fs2.removeSync( tmpFile );
        done();
      }
    }

    z.on( 'ready', onReady ).connect();

  });

  it('works with highland streams', function(done){

    var stream = z.stream();
    var start = 0;
    var stop = 5;
    var count = start;
    var interval;
    var receiver = _();

    stream.pipe( receiver );

    receiver.on('data', function(chunk){
      var data = JSON.parse( chunk.toString() );
      data.should.have.property( 'foo' );
      data.foo.should.be.within( start, stop );
    });

    interval = setInterval(function(){
      if ( count >= stop ) {
        clearInterval( interval );
        done();
      } else {
        sock.send( JSON.stringify( { foo: count } ) + '\n' );
        count += 1;
      }
    }, 100);

  });


});