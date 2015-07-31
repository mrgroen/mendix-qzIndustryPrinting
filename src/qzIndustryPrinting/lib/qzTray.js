/*jslint white:true, nomen:true, plusplus:true, vars:true, regexp:true */
/*jshint browser:true */
/*global mx, mxui, mendix, dojo, require, console, define, module, WebSocket, alert */
/*
    qzTray Dojo Lib
    ========================

    @file      : qzTray.js
    @version   : 1.0
    @author    : Marcus Groen
    @date      : Wed, 08 Jul 2015 14:04:00 GMT
    @copyright : Incentro
    @license   : Apache 2.0

    Documentation
    ========================
    QZ Tray dojo lib.
*/
define([ "dojo/_base/lang", "qzIndustryPrinting/lib/jquery-1.11.2"],
function(lang, _jQuery) {
  "use strict";
  
  var $ = _jQuery.noConflict(true);
  
  return {

    "load": function(){
      
      // We need to set a global variable, once loaded this will always be used!
      if (typeof window.qzLib === "undefined" ) {
        window.qzLib = {

          isReady: false,
          websocket: null,
          qzConfig: {
            preemptive: {isActive: '', getVersion: '', getPrinter: '', getLogPostScriptFeatures: ''},
            callbackMap: {
              findPrinter:     'qzDoneFinding',
              findPrinters:    'qzDoneFinding',
              appendFile:      'qzDoneAppending',
              appendXML:       'qzDoneAppending',
              appendPDF:       'qzDoneAppending',
              appendImage:     'qzDoneAppending',
              print:           'qzDonePrinting',
              printPS:         'qzDonePrinting',
              printHTML:       'qzDonePrinting',
              findPorts:       'qzDoneFindingPorts',
              openPort:        'qzDoneOpeningPort',
              closePort:       'qzDoneClosingPort',
              findNetworkInfo: 'qzDoneFindingNetwork'
            },
            protocol: ["wss://", "ws://"],   // Protocols to use, will try secure WS before insecure
            uri: "localhost",                // Base URL to server
            ports: [8181, 8282, 8383, 8484], // Ports to try, insecure WS uses port (ports[x] + 1)
            protocolIndex: 0,                // Used to track which value in 'protocol' array is being used
            portIndex: 0,                    // Used to track which value in 'ports' array is being used
            keepAlive: (60 * 1000)           // Interval in millis to send pings to server
          },

          // Equivalent of VisualBasic CHR() function.
          chr: function (i) {
              return String.fromCharCode(i);
          },
          
          getSiteCertificate: function (callback) {
            if (typeof this.siteCertificate === "undefined") {
              // QZ demo certificate.
              callback("-----BEGIN CERTIFICATE-----\n" +
                  "MIIFAzCCAuugAwIBAgICEAIwDQYJKoZIhvcNAQEFBQAwgZgxCzAJBgNVBAYTAlVT\n" +
                  "MQswCQYDVQQIDAJOWTEbMBkGA1UECgwSUVogSW5kdXN0cmllcywgTExDMRswGQYD\n" +
                  "VQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMxGTAXBgNVBAMMEHF6aW5kdXN0cmllcy5j\n" +
                  "b20xJzAlBgkqhkiG9w0BCQEWGHN1cHBvcnRAcXppbmR1c3RyaWVzLmNvbTAeFw0x\n" +
                  "NTAzMTkwMjM4NDVaFw0yNTAzMTkwMjM4NDVaMHMxCzAJBgNVBAYTAkFBMRMwEQYD\n" +
                  "VQQIDApTb21lIFN0YXRlMQ0wCwYDVQQKDAREZW1vMQ0wCwYDVQQLDAREZW1vMRIw\n" +
                  "EAYDVQQDDAlsb2NhbGhvc3QxHTAbBgkqhkiG9w0BCQEWDnJvb3RAbG9jYWxob3N0\n" +
                  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtFzbBDRTDHHmlSVQLqjY\n" +
                  "aoGax7ql3XgRGdhZlNEJPZDs5482ty34J4sI2ZK2yC8YkZ/x+WCSveUgDQIVJ8oK\n" +
                  "D4jtAPxqHnfSr9RAbvB1GQoiYLxhfxEp/+zfB9dBKDTRZR2nJm/mMsavY2DnSzLp\n" +
                  "t7PJOjt3BdtISRtGMRsWmRHRfy882msBxsYug22odnT1OdaJQ54bWJT5iJnceBV2\n" +
                  "1oOqWSg5hU1MupZRxxHbzI61EpTLlxXJQ7YNSwwiDzjaxGrufxc4eZnzGQ1A8h1u\n" +
                  "jTaG84S1MWvG7BfcPLW+sya+PkrQWMOCIgXrQnAsUgqQrgxQ8Ocq3G4X9UvBy5VR\n" +
                  "CwIDAQABo3sweTAJBgNVHRMEAjAAMCwGCWCGSAGG+EIBDQQfFh1PcGVuU1NMIEdl\n" +
                  "bmVyYXRlZCBDZXJ0aWZpY2F0ZTAdBgNVHQ4EFgQUpG420UhvfwAFMr+8vf3pJunQ\n" +
                  "gH4wHwYDVR0jBBgwFoAUkKZQt4TUuepf8gWEE3hF6Kl1VFwwDQYJKoZIhvcNAQEF\n" +
                  "BQADggIBAFXr6G1g7yYVHg6uGfh1nK2jhpKBAOA+OtZQLNHYlBgoAuRRNWdE9/v4\n" +
                  "J/3Jeid2DAyihm2j92qsQJXkyxBgdTLG+ncILlRElXvG7IrOh3tq/TttdzLcMjaR\n" +
                  "8w/AkVDLNL0z35shNXih2F9JlbNRGqbVhC7qZl+V1BITfx6mGc4ayke7C9Hm57X0\n" +
                  "ak/NerAC/QXNs/bF17b+zsUt2ja5NVS8dDSC4JAkM1dD64Y26leYbPybB+FgOxFu\n" +
                  "wou9gFxzwbdGLCGboi0lNLjEysHJBi90KjPUETbzMmoilHNJXw7egIo8yS5eq8RH\n" +
                  "i2lS0GsQjYFMvplNVMATDXUPm9MKpCbZ7IlJ5eekhWqvErddcHbzCuUBkDZ7wX/j\n" +
                  "unk/3DyXdTsSGuZk3/fLEsc4/YTujpAjVXiA1LCooQJ7SmNOpUa66TPz9O7Ufkng\n" +
                  "+CoTSACmnlHdP7U9WLr5TYnmL9eoHwtb0hwENe1oFC5zClJoSX/7DRexSJfB7YBf\n" +
                  "vn6JA2xy4C6PqximyCPisErNp85GUcZfo33Np1aywFv9H+a83rSUcV6kpE/jAZio\n" +
                  "5qLpgIOisArj1HTM6goDWzKhLiR/AeG3IJvgbpr9Gr7uZmfFyQzUjvkJ9cybZRd+\n" +
                  "G8azmpBBotmKsbtbAU/I/LVk8saeXznshOVVpDRYtVnjZeAneso7\n" +
                  "-----END CERTIFICATE-----\n" +
                  "--START INTERMEDIATE CERT--\n" +
                  "-----BEGIN CERTIFICATE-----\n" +
                  "MIIFEjCCA/qgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgawxCzAJBgNVBAYTAlVT\n" +
                  "MQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYDVQQKDBJRWiBJ\n" +
                  "bmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMsIExMQzEZMBcG\n" +
                  "A1UEAwwQcXppbmR1c3RyaWVzLmNvbTEnMCUGCSqGSIb3DQEJARYYc3VwcG9ydEBx\n" +
                  "emluZHVzdHJpZXMuY29tMB4XDTE1MDMwMjAwNTAxOFoXDTM1MDMwMjAwNTAxOFow\n" +
                  "gZgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOWTEbMBkGA1UECgwSUVogSW5kdXN0\n" +
                  "cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMxGTAXBgNVBAMM\n" +
                  "EHF6aW5kdXN0cmllcy5jb20xJzAlBgkqhkiG9w0BCQEWGHN1cHBvcnRAcXppbmR1\n" +
                  "c3RyaWVzLmNvbTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANTDgNLU\n" +
                  "iohl/rQoZ2bTMHVEk1mA020LYhgfWjO0+GsLlbg5SvWVFWkv4ZgffuVRXLHrwz1H\n" +
                  "YpMyo+Zh8ksJF9ssJWCwQGO5ciM6dmoryyB0VZHGY1blewdMuxieXP7Kr6XD3GRM\n" +
                  "GAhEwTxjUzI3ksuRunX4IcnRXKYkg5pjs4nLEhXtIZWDLiXPUsyUAEq1U1qdL1AH\n" +
                  "EtdK/L3zLATnhPB6ZiM+HzNG4aAPynSA38fpeeZ4R0tINMpFThwNgGUsxYKsP9kh\n" +
                  "0gxGl8YHL6ZzC7BC8FXIB/0Wteng0+XLAVto56Pyxt7BdxtNVuVNNXgkCi9tMqVX\n" +
                  "xOk3oIvODDt0UoQUZ/umUuoMuOLekYUpZVk4utCqXXlB4mVfS5/zWB6nVxFX8Io1\n" +
                  "9FOiDLTwZVtBmzmeikzb6o1QLp9F2TAvlf8+DIGDOo0DpPQUtOUyLPCh5hBaDGFE\n" +
                  "ZhE56qPCBiQIc4T2klWX/80C5NZnd/tJNxjyUyk7bjdDzhzT10CGRAsqxAnsjvMD\n" +
                  "2KcMf3oXN4PNgyfpbfq2ipxJ1u777Gpbzyf0xoKwH9FYigmqfRH2N2pEdiYawKrX\n" +
                  "6pyXzGM4cvQ5X1Yxf2x/+xdTLdVaLnZgwrdqwFYmDejGAldXlYDl3jbBHVM1v+uY\n" +
                  "5ItGTjk+3vLrxmvGy5XFVG+8fF/xaVfo5TW5AgMBAAGjUDBOMB0GA1UdDgQWBBSQ\n" +
                  "plC3hNS56l/yBYQTeEXoqXVUXDAfBgNVHSMEGDAWgBQDRcZNwPqOqQvagw9BpW0S\n" +
                  "BkOpXjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAJIO8SiNr9jpLQ\n" +
                  "eUsFUmbueoxyI5L+P5eV92ceVOJ2tAlBA13vzF1NWlpSlrMmQcVUE/K4D01qtr0k\n" +
                  "gDs6LUHvj2XXLpyEogitbBgipkQpwCTJVfC9bWYBwEotC7Y8mVjjEV7uXAT71GKT\n" +
                  "x8XlB9maf+BTZGgyoulA5pTYJ++7s/xX9gzSWCa+eXGcjguBtYYXaAjjAqFGRAvu\n" +
                  "pz1yrDWcA6H94HeErJKUXBakS0Jm/V33JDuVXY+aZ8EQi2kV82aZbNdXll/R6iGw\n" +
                  "2ur4rDErnHsiphBgZB71C5FD4cdfSONTsYxmPmyUb5T+KLUouxZ9B0Wh28ucc1Lp\n" +
                  "rbO7BnjW\n" +
                  "-----END CERTIFICATE-----\n");
            } else {
              callback(this.siteCertificate);
            }
          },
          
          signRequest: function (toSign, callback) {
            // not signed
            callback();
          },
          
          socketError: function (event) {
            console.error('WebSocket error: ' + event.reason);
          },
          
          socketClose: function (event) {
            console.log('WebSocket closed: ' + event.reason);
          },
          
          qzNoConnection: function () {
            console.error("Unable to connect to QZ Tray, is it running?");
            alert("Unable to connect to QZ Tray, is it running?");
          },
          
          isLoaded: function () {
            return (typeof window.qz !== "undefined") ? true : false;
          },
          
          isPrinterSelected: function () {
            return (this.isLoaded() && typeof window.qz.getPrinter() !== "undefined" &&  window.qz.getPrinter() !== undefined) ? true : false;
          },
          
          useDefaultPrinter: function () {
            if (this.isLoaded()) {
              
              // Automatically gets called when "qz.findPrinter()" is finished.
              window.qz.qzDoneFinding = function() {
                if (this.isPrinterSelected()) {
                  console.log("Default printer selected: " + window.qz.getPrinter());
                } else {
                  console.error("No default printer found.");
                }
                // Remove reference to this function.
                window.qz.qzDoneFinding = null;
              };
              
              // Searches for default printer
              window.qz.findPrinter();
              
            }
          },
          
          deployQZ: function () {
              //Old standard of WebSocket used const CLOSED as 2, new standards use const CLOSED as 3, we need the newer standard for jetty
              if (typeof WebSocket !== "undefined" && WebSocket.CLOSED !== null && WebSocket.CLOSED > 2) {
                  console.log('Starting deploy of qz');
                  this.connectWebsocket(this.qzConfig.ports[this.qzConfig.portIndex]);
              } else {
                  console.error("WebSocket not supported");
                  window.deployQZ = null;
              }
          },

          connectWebsocket: function (port) {
              console.log('Attempting connection on port ' + port);

              try {
                  this.websocket = new WebSocket(this.qzConfig.protocol[this.qzConfig.protocolIndex] + this.qzConfig.uri + ":" + port);
              }
              catch(e) {
                  console.error(e);
              }

              if (this.websocket !== null) {
                  this.websocket.valid = false;

                  this.websocket.onopen = lang.hitch(this,function(evt){
                      console.log('Open:');
                      console.log(evt);

                      this.websocket.valid = true;
                      this.connectionSuccess(this.websocket);

                      // Create the QZ object
                      this.createQZ(this.websocket);

                      // Send keep-alive to the websocket so connection does not timeout
                      // keep-alive over reconnecting so server is always able to send to client
                      window.setInterval(lang.hitch(this,function(){
                        this.websocket.send("ping");
                      }), this.qzConfig.keepAlive);
                  });

                  this.websocket.onclose = lang.hitch(this,function(event){
                      if (this.websocket.valid || this.qzConfig.portIndex >= this.qzConfig.ports.length) {
                        this.socketClose(event);
                      }
                  });

                  this.websocket.onerror = lang.hitch(this,function(event) {
                      if (this.websocket.valid || this.qzConfig.portIndex >= this.qzConfig.ports.length) {
                        this.socketError(event);
                      }

                      // Move on to the next port
                      if (!this.websocket.valid) {
                          if (++this.qzConfig.portIndex < this.qzConfig.ports.length) {
                              this.connectWebsocket(this.qzConfig.ports[this.qzConfig.portIndex] + this.qzConfig.protocolIndex);
                          } else {
                              if (++this.qzConfig.protocolIndex < this.qzConfig.protocol.length) {
                                  //Try again using insecure protocol
                                  this.qzConfig.portIndex = 0;
                                  this.connectWebsocket(this.qzConfig.ports[this.qzConfig.portIndex] + this.qzConfig.protocolIndex);
                              } else {
                                  this.qzNoConnection();
                              }
                          }
                      }
                  });

              } else {
                  console.warn('Websocket connection failed');
                  this.websocket = null;
                  this.qzNoConnection();
              }
          },

          connectionSuccess: function (websocket) {
              console.log('Websocket connection successful');

              websocket.sendObj = lang.hitch(this,function(objMsg) {
                var msg = JSON.stringify(objMsg);

                console.log("Sending " + msg);
                var ws = this.websocket;

                // Determine if the message requires signing
                if (objMsg.method === 'listMessages' || Object.keys(this.qzConfig.preemptive).indexOf(objMsg.method) !== -1) {
                  ws.send(msg);
                } else {
                  this.signRequest(msg,
                    function(signature) {
                      ws.send(signature + msg);
                    }
                  );
                }
              });

              websocket.onmessage = lang.hitch(this,function(evt) {
                  var message = JSON.parse(evt.data);

                  if (message.error !== undefined) {
                      console.log(message.error);
                      return;
                  }

                  // After we ask for the list, the value will come back as a message.
                  // That means we have to deal with the listMessages separately from everything else.
                  if (message.method === 'listMessages') {
                      // Take the list of messages and add them to the qz object
                      this.mapMethods(websocket, message.result);

                  } else {
                      // Got a return value from a call
                      console.log('Message:');
                      console.log(message);

                      if (typeof message.result === 'string') {
                          //unescape special characters
                          message.result = message.result.replace(/%5C/g, "\\").replace(/%22/g, "\"");

                          //ensure boolean strings are read as booleans
                          if (message.result === "true" || message.result === "false") {
                              message.result = (message.result === "true");
                          }

                          if (message.result.substring(0, 1) === '[') {
                              message.result = JSON.parse(message.result);
                          }

                          //ensure null is read as null
                          if (message.result === "null") {
                              message.result = null;
                          }
                      }

                      if (message.callback !== 'setupMethods' && message.result !== undefined && message.result.constructor !== Array) {
                          message.result = [message.result];
                      }

                      // Special case for getException
                      if (message.method === 'getException') {
                          var result = message.result;
                          message.result = {
                              getLocalizedMessage: function() {
                                  return result;
                              }
                          };
                      }

                      if (message.callback === 'setupMethods') {
                          console.log("Resetting function call");
                          console.log(message.result);
                          window.qz[message.method] = function() {
                              return message.result;
                          };
                      }

                      if (message.callback !== null) {
                          try {
                              console.log("Callbacking: " + message.callback);
                              if (typeof window.qz[message.callback] !== "undefined") {
                                window.qz[message.callback].apply(this, message.init ? [message.method] : message.result);
                              } else if (typeof window[message.callback] !== "undefined") {
                                window[message.callback].apply(this, message.result);
                              } else {
                                console.warn("Callback [" + message.callback + "] is not defined.");
                              }
                          } catch(err) {
                              console.error(err);
                          }
                      }
                  }

                  console.log("Finished processing message");
              });
          },

          createQZ: function (websocket) {
              // Get list of methods from websocket
              this.getSiteCertificate(lang.hitch(this,function(cert) {
                  websocket.sendObj({method: 'listMessages', params: [cert]});
                  window.qz = {};
              }));
          },

          createMethod: function(_name, _numParams, _returnType) {
              //create function to map function name to parameter counted function
              window.qz[_name] = lang.hitch(this,function() {
                  var func;
                  if (typeof arguments[arguments.length - 1] === 'function') {
                      func = window.qz[_name + '_' + (arguments.length - 1)];
                  } else {
                      func = window.qz[_name + '_' + arguments.length];
                  }

                  func.apply(this, arguments);
              });

              //create parameter counted function to include overloaded java methods in javascript object
              window.qz[_name + '_' + _numParams] = lang.hitch(this,function() {
                  var args = [];
                  var i = 0;
                  for(i = 0; i < _numParams; i++) {
                      args.push(arguments[i]);
                  }

                  var cb = arguments[arguments.length - 1];
                  var cbName = _name + '_callback';

                  if ($.isFunction(cb)) {
                      var method = cb.name;

                      // Special case for IE, which does not have function.name property ..
                      if (typeof method === "undefined") {
                          method = cb.toString().match(/^function\s*([^\s(]+)/)[1];
                      }

                      if (method === 'setupMethods') {
                          cbName = method;
                      }

                      window.qz[cbName] = cb;
                  } else {
                      console.log("Using mapped callback " + this.qzConfig.callbackMap[_name] + "() for " + _name + "()");
                      cbName = this.qzConfig.callbackMap[_name];
                  }

                  console.log("Calling " + _name + "(" + args + ") --> CB: " + cbName + "()");
                  this.websocket.sendObj({method: _name, params: args, callback: cbName, init: (cbName === 'setupMethods')});
              });
          },
          
          mapMethods: function (websocket, methods) {
              console.log('Adding ' + methods.length + ' methods to qz object');
              var x = 0;
              for(x = 0; x < methods.length; x++) {
                  var name = methods[x].name;
                  var returnType = methods[x].returns;
                  var numParams = methods[x].parameters;

                  // Determine how many parameters there are and create method with that many
                  this.createMethod(name,numParams,returnType);
              }

              // Re-setup all functions with static returns
              var key;
              for(key in this.qzConfig.preemptive) {
                if (this.qzConfig.preemptive.hasOwnProperty(key)) {
                  window.qz[key](this.setupMethods);
                }
              }

              console.log("Sent methods off to get rehabilitated");
          },

          setupMethods: function setupMethods(methodName) {
              if ($.param(this.qzConfig.preemptive).length > 0) {
                  console.log("Reset " + methodName);
                  delete this.qzConfig.preemptive[methodName];

                  console.log("Methods left to return: " + $.param(this.qzConfig.preemptive).length);

                  // Fire ready method when everything on the QZ object has been added
                  if ($.param(this.qzConfig.preemptive).length === 0) {
                      this.isReady = true;
                  }
              }
          }

        };
      }

      return window.qzLib;
    }

  };

});