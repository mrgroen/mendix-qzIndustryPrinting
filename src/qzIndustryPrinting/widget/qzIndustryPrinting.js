/*jslint white:true, nomen:true, plusplus:true, vars:true, unparam: true */
/*jshint browser:true */
/*global mx, define, require, browser, devel, console, document, window, alert */
/*mendix */
/*
    qzIndustryPrinting
    ========================

    @file      : qzIndustryPrinting.js
    @version   : 1.0.1
    @author    : Marcus Groen
    @date      : Wed, 08 Jul 2015 14:04:00 GMT
    @copyright : Incentro
    @license   : Apache 2.0

    Documentation
    ========================
    Widget to communicate with QZ Tray.
*/
define([

  // Mixins
  "dojo/_base/declare", "mxui/widget/_WidgetBase",

  // Client API and DOJO functions
  "mxui/dom", "dojo/dom", "dojo/query", "dojo/dom-prop", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style",
  "dojo/dom-construct", "dojo/_base/array", "dojo/_base/lang", "dojo/html", "dojo/_base/event",

  // External libraries
  "qzIndustryPrinting/lib/qzTray"

], function (

  // Mixins
  declare, _WidgetBase,

  // Client API and DOJO functions
  dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle,
  domConstruct, dojoArray, lang, html, event,

  // External libraries
  _qzTray

) {

  "use strict";
  _qzTray.load();

  // Declare widget's prototype.
  return declare("qzIndustryPrinting.widget.qzIndustryPrinting", [_WidgetBase], {

      /* BEGIN - Parameters configured in the Modeler. */

      jsonEntity: "",
      jsonAttribute: "",
      jsonMicroflow: "",
      messageEntity: "",
      messageAttribute: "",
      signRequestMicroflow: "",
      siteCertificateMicroflow: "",

      /* END - Parameters configured in the Modeler. */

      // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
      _handles: null,
      _mxObj: null,

      // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
      constructor: function(){
          this._handles = [];
      },

      // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
      postCreate: function(){
        // create command entity
        if (this._mxObj === null) {
          mx.data.action({
            params: {
              actionname: this.jsonMicroflow
            },
            callback: lang.hitch(this,function mxDataActionCallback(guid){
              mx.data.get({
                guid: guid,
                callback: function mxDataGetCallback(obj){
                  this._mxObj = obj;
                  this._addSubscriptions();
                },
                error: function mxDataGetError(e){
                  if(e){
                    console.warn(e.description);
                  }
                }
              },this);
            }),
            error: function mxDataActionError(e){
              if(e){
                console.warn(e.description);
              }
            }
          });
        }

        // create sign request function
        window.qzLib.signing = {};
        window.qzLib.signing.signRequestMicroflow = this.signRequestMicroflow;
        window.qzLib.signing.messageEntity = this.messageEntity;
        window.qzLib.signing.messageAttribute = this.messageAttribute;
        window.qzLib.signRequest = function(toSign,callback){
          mx.data.create({
            entity: window.qzLib.signing.messageEntity,
            callback: function mxDataCreateCallback(obj){
              obj.set(window.qzLib.signing.messageAttribute, toSign);
              mx.data.save({
                mxobj: obj,
                callback: function mxDataSaveCallback(){
                  mx.data.action({
                    params: {
                      applyto: "selection",
                      actionname: window.qzLib.signing.signRequestMicroflow,
                      guids: [obj.getGuid()]
                    },
                    callback: function mxDataActionCallback(returnObject) {
                      callback(returnObject);
                    },
                    error: function mxDataActionError(e) {
                      if (e) {
                        console.warn(e.description);
                      }
                      callback();
                    }
                  });
                },
                error: function mxDataSaveError(e){
                  if (e) {
                    console.warn(e.description);
                  }
                  callback();
                }
              },this);
            },
            error: function mxDataCreateError(e){
              if (e) {
                console.warn(e.description);
              }
              callback();
            }
          },this);
        };

        // retrieve site certificate from database
        if (window.qzLib.siteCertificate === undefined) {
          this._execMF(null, this.siteCertificateMicroflow, function siteCertificateMicroflow(obj){
            // store site certificate in browser
            if (obj) {
              window.qzLib.siteCertificate = obj;
            }
            // Connect to QZ Tray
            window.qzLib.deployQZ();
          });
        }
      },

      // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
      update: function(obj, callback){
        if (callback !== undefined) {
          callback();
        }
      },

      // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
      enable: function(){ return; },

      // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
      disable: function(){ return; },

      // mxui.widget._WidgetBase.resize is called when the pages layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
      resize: function(box){ return; },

      // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
      uninitialize: function(){
        // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        if (this._handles.length > 0) {
          dojoArray.forEach(this._handles, function unsubscribe(handle) {
            mx.data.unsubscribe(handle);
          });
        }
      },

      // send command to QZ Tray
      _sendCommand: function(){
        var jsonObj = null;
        try {
          //Using JSON attribute given in the widget parameters.
          jsonObj = JSON.parse(this._mxObj.jsonData.attributes[this.jsonAttribute].value);
        } catch(e) {
          console.warn("Failed parsing JSON: " + e.message);
        }
        if (jsonObj !== null) {
          // Automatically gets called when "qz.findPrinter()" is finished.
          window.qzDoneFinding = function(){
            var commands = [];
            // loop commands
            dojoArray.forEach(jsonObj.commands,function eachCommand(value,key){
              if (value.hasOwnProperty("chars")) {
                var charsCommand = "";
                dojoArray.forEach(value.chars,function eachChar(value,key){
                  charsCommand = charsCommand + window.qzLib.chr(value);
                });
                //window.qz.append(charsCommand);
                commands.push(charsCommand);
              } else if (value.hasOwnProperty("append")) {
                //window.qz.append(value.append);
                commands.push(value.append);
              }
            });
            window.qz.append(commands.join(""));
            window.qz.print();
            // Remove reference to this function.
            window.qzDoneFinding = null;
          };
          // Searches for locally installed printer with specified name.
          if (window.qz.getPrinter() !== jsonObj.printer) {
            window.qz.findPrinter(jsonObj.printer);
          } else {
            window.qzDoneFinding();
          }
        }
      },

      // set mendix data subscriptions
      // YOLO
      _addSubscriptions: function(){

          if (this._mxObj !== null){
            var jsonEntitySubscription = mx.data.subscribe({
              guid: this._mxObj.getGuid(),
              callback: lang.hitch(this, function mxSubscribeCallback(guid) {
                console.log("Recieved change on QZ print command entity: " + guid);
                mx.data.get({
                  guid: guid,
                  callback: function mxDataGetCallback(obj){
                    this._mxObj = obj;
                  },
                  error: function mxDataGetError(e){
                    if(e){
                      console.warn(e.description);
                    }
                  }
                },this);
                if (window.qzLib.isReady === true && window.qzLib.websocket.readyState !== undefined && window.qzLib.websocket.readyState === 1) {
                  this._sendCommand();
                } else {
                  console.error("Unable to connect to QZ Tray, is it running?");
                  alert("Unable to connect to QZ Tray, is it running?");
                }
              })
            });
            this._handles.push(jsonEntitySubscription);
          }

      },

      // run a mendix microflow
      _execMF: function _execMF(obj,mf,cb){
          if (mf) {
              var params = {
                  applyto: "selection",
                  actionname: mf,
                  guids: []
              };
              if (obj) {
                  params.guids = [obj.getGuid()];
              }
              mx.data.action({
                  params: params,
                  callback: function mxDataActionCallback(objs) {
                      if (cb) {
                          cb(objs);
                      }
                  },
                  error: function mxDataActionError(error) {
                      if (cb) {
                          cb();
                      }
                      console.warn(error.description);
                  }
              }, this);

          } else if (cb) {
              cb();
          }
      }

  });
});
require(["qzIndustryPrinting/widget/qzIndustryPrinting"], function(){
    "use strict";
    return;
});
