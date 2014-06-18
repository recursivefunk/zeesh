
'use strict';

var zmq = require( 'zmq' );
var _ = require( 'highland' );
var util = require( 'util' );
var EventEmitter = require( 'events' ).EventEmitter;

var ZStream = function( opts ) {
  var self = this;
  opts = opts || {};
  this._host = opts.host || '127.0.0.1';
  this._port = opts.port || 3000;
  var endpoint = 'tcp://' + this._host + ':' + this._port;
  this._sub = zmq.socket( 'pull' );
  this._subscriptions = {};
  this._stream = _();
  this._sub.on('message', function(msg){
    self._stream.write( msg );
  });
  return this;
};

util.inherits( ZStream, EventEmitter );

ZStream.prototype.connect = function() {
  var endpoint = 'tcp://' + this._host + ':' + this._port;
  this._sub.connect( endpoint );
  this.emit( 'ready' );
  return this;
};

ZStream.prototype.stream = function() {
  var self = this;
  return this._stream;
};


module.exports = ZStream;