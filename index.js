var WebSocket = require('ws');
var JsonComm = require('@spacebrew/server-core').JsonComm;
var Client = require('@spacebrew/server-core').Leaf;
//var Route = require('@spacebrew/server-core').Route;
var Admin = require('@spacebrew/server-core').Admin;

var WebSocketServer = function(manager, options, logger){
  this.manager = manager;
  this.logger = logger;
  this.jsonComm = new JsonComm(this.manager, 
                               this.clientCallback, 
                               this.adminCallback,
                               logger);

  // setup logging aliases
  if (this.logger !== undefined){
    this.error = logger.error;
    this.warn = logger.warn;
    this.info = logger.info;
    this.trace = logger.trace;
  } else {
    this.error = function(){
      throw new Error(arguments);
    };
    this.warn = this.info = this.trace = function(){};
  }

  this.startWebsocket(options);
};

WebSocketServer.prototype.adminCallback = function(message, handle){
  handle.send(JSON.stringify(message));
};

WebSocketServer.prototype.clientCallback = function(message, handle){
  handle.send(JSON.stringify(message));
};

WebSocketServer.getClientAddress = function(connection){
  try{
    var out = {};
    connection._socket._handle.getpeername(out);
    return out.address; //connection.upgradeReq.headers.host;
  } catch (e){
    this.info( 
      '[printAllTrustedClients] unable to access remote address.',
      e);
    return 'unknown';
  }
};

WebSocketServer.prototype.startWebsocket = function(options){
  var self = this;
  options = options || {};
  options.port = options.port || 9000;
  options.host = options.host || '0.0.0.0';
  this.websocket = new WebSocket.Server(options);
  this.websocket.on('connection', function(connection){
    var admin, client;
    connection.on('message', function(message/*, flags*/){
      try{
        var json = JSON.parse(message);
        var item = self.jsonComm.
          handleMessage(json, 
                        {ip:WebSocketServer.getClientAddress(connection)}, 
                        connection);
        if (item instanceof Admin){
          admin = item;
        } else if (item instanceof Client){
          client = item;
        }
      } catch (se){
        self.warn(
          '[Servers::startWebsocket::onConnection::onMessage]',
          'could not parse message as JSON');
        self.warn(
          '[Servers::startWebsocket::onConnection::onMessage]',
          se);
      }
    });
    connection.on('close', function(/*connection*/){
      if (admin !== undefined){
        self.jsonComm.spacebrewManager.removeAdmin(admin);
      }
      if (client !== undefined){
        self.jsonComm.spacebrewManager.removeClient(client);
      }
    });
    connection.on('error', function(e){
      self.error('ERROR with websocket', e);
    });
  });
};

module.exports = WebSocketServer;
