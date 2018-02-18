var chai = require('chai');
var expect = chai.expect;
var D = require('./data.js');
var d = new D();
var WebSocket = require('ws');

var portLegacy = 9011;
var portNew = 9000;

//run legacy spacebrew as child process
var ChildProcess = require('child_process');
var legacyServer = 
  ChildProcess.spawn('./node_server.js', 
                     ['--port', portLegacy, '--nopersist'], 
                     {stdio:'ignore'});

//run new spacebrew
var Servers = require('../servers.js');
var servers = new Servers();
servers.startWebsocket();

var wsLegacy, wsNew;
var msgLegacy, msgNew;
msgLegacy = msgNew = function(){};
var closeLegacy, closeNew;
closeLegacy = closeNew = function(){
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
  var count = new Counter(2, done);
  var sent = function(e){
    if (e){
      expect(0);
    }
    count.inc();
  };
  wsLegacy.send(s, sent);
  wsNew.send(s, sent);
};

var confirmResultIs = function(json, done){
  var count = new Counter(2, done);
  msgLegacy = function(msg){
    var inJson = JSON.parse(msg);
    expect(inJson).to.deep.equal(json);
    count.inc();
  };
  msgNew = function(msg){
    var inJson = JSON.parse(msg);
    expect(inJson).to.deep.equal(json);
    count.inc();
  };
};

var confirmResultsMatch = function(done){
  var result;
  var count = new Counter(2, done);
  msgLegacy = function(msg){
    var inJson = JSON.parse(msg);
    if (result === undefined){
      result = inJson;
    } else {
      expect(inJson).to.deep.equal(result);
    }
    count.inc();
  };
  msgNew = function(msg){
    var inJson = JSON.parse(msg);
    if (result === undefined){
      result = inJson;
    } else {
      expect(inJson).to.deep.equal(result);
    }
    count.inc();
  };
};

//connect via websocket
describe('Websocket API', function(){
  it('successfully connects', function(done){
    //set up the connections
    wsLegacy = new WebSocket('ws://localhost:'+portLegacy+'/');
    wsNew = new WebSocket('ws://localhost:'+portNew+'/');

    var numConnected = 0;
    var trackConnect = function(){
      numConnected++;
      if (numConnected === 2){
        done();
      } else if (numConnected > 2){
        //should not be possible
        expect(0);
      }
    };
    
    wsLegacy.on('open', function(){
      trackConnect();
    });
    wsNew.on('open', function(){
      trackConnect();
    });

    wsLegacy.on('message', msgLegacy);
    wsNew.on('message', msgNew);

    wsLegacy.on('close', closeLegacy);
    wsNew.on('close', closeNew);
  });
  it('can register as client', function(){
    
  });
});
