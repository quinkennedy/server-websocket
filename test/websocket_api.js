var chai = require('chai');
var expect = chai.expect;
var D = require('./data.js');
var d = new D();
var WebSocket = require('ws');

var wsPort = 9000;

//run spacebrew
var Spacebrew = require('@spacebrew/server-core').Manager;
var WebSocketServer = require('../index.js');
var spacebrew = new Spacebrew();
var websocketServer = new WebSocketServer(spacebrew,
                                          {port:wsPort, host:'127.0.0.1'},
                                          undefined);

var websocket;
var message = function(){};
var closeWS = function(){
  //not expected to close yet
  expect(0);
};

var Counter = function(toNum, done){
  var count = 0;
  this.inc = function(){
    count++;
    if (count == toNum){
      done();
    } else {
      expect(0);
    }
  };
};

var sendMsg = function(json, done){
  var s = JSON.stringify(json);
  var count = new Counter(1, done);
  var sent = function(e){
    if (e){
      expect(0);
    }
    count.inc();
  };
  websocket.send(s, sent);
};

var confirmResultIs = function(json, done){
  var count = new Counter(1, done);
  message = function(msg){
    var inJson = JSON.parse(msg);
    expect(inJson).to.deep.equal(json);
    count.inc();
  };
};

//var confirmResultsMatch = function(done){
//  var result;
//  var count = new Counter(1, done);
//  msgLegacy = function(msg){
//    var inJson = JSON.parse(msg);
//    if (result === undefined){
//      result = inJson;
//    } else {
//      expect(inJson).to.deep.equal(result);
//    }
//    count.inc();
//  };
//  msgNew = function(msg){
//    var inJson = JSON.parse(msg);
//    if (result === undefined){
//      result = inJson;
//    } else {
//      expect(inJson).to.deep.equal(result);
//    }
//    count.inc();
//  };
//};

//connect via websocket
describe('Websocket API', function(){
  it('successfully connects', function(done){
    //set up the connections
    websocket = new WebSocket('ws://localhost:' + wsPort + '/');

    var numConnected = 0;
    var trackConnect = function(){
      numConnected++;
      if (numConnected === 1){
        done();
      } else if (numConnected > 1){
        //should not be possible
        expect(0);
      }
    };
    
    websocket.on('open', function(){
      trackConnect();
    });

    websocket.on('message', message);

    websocket.on('close', closeWS);
  });
  it('can register as client', function(){
    
  });
});
