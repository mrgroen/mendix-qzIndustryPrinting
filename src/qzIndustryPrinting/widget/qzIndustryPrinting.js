/*jslint white:true, nomen:true, plusplus:true, vars:true */
/*jshint browser:true */
/*global mx, define, require, browser, devel, console, document */
/*mendix */
/*
    qzIndustryPrinting
    ========================

    @file      : qzIndustryPrinting.js
    @version   : 1.0
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
  "qzIndustryPrinting/lib/jquery-1.11.2",
  "qzIndustryPrinting/lib/qzTray"

], function (

  // Mixins
  declare, _WidgetBase,

  // Client API and DOJO functions
  dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle,
  domConstruct, dojoArray, lang, html, event,

  // External libraries
  _jQuery,
  _qzTray
  
) {

  "use strict";

  var $ = _jQuery.noConflict(true);
  var qzTray = _qzTray.load();

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
            callback: lang.hitch(this,function(guid){
              mx.data.get({
                guid: guid,
                callback: function(obj){
                  this._mxObj = obj;
                  this._addSubscriptions();
                },
                error: function(e){
                  if(e){
                    console.warn(e.description);
                  }
                }
              },this);
            }),
            error: function(e){
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
            callback: function(obj){
              obj.set(window.qzLib.signing.messageAttribute, toSign);
              mx.data.save({
                mxobj: obj,
                callback: function(){
                  mx.data.action({
                    params: {
                      applyto: "selection",
                      actionname: window.qzLib.signing.signRequestMicroflow,
                      guids: [obj.getGuid()]
                    },
                    callback: function (returnObject) {
                      callback(returnObject);
                    },
                    error: function (e) {
                      if (e) {
                        console.warn(e.description);
                      }
                      callback();
                    }
                  });
                },
                error: function(e){
                  if (e) {
                    console.warn(e.description);
                  }
                  callback();
                }
              },this);
            },
            error: function(e){
              if (e) {
                console.warn(e.description);
              }
              callback();
            }
          },this);
        };

        // retrieve site certificate from database
        if (typeof window.qzLib.siteCertificate === "undefined") {
          this._execMF(null, this.siteCertificateMicroflow, function(obj){
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
        if (typeof callback !== "undefined") {
          callback();
        }
      },

      // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
      enable: function(){},

      // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
      disable: function(){},

      // mxui.widget._WidgetBase.resize is called when the pages layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
      resize: function(box){},

      // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
      uninitialize: function(){
        // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        if (this._handles.length > 0) {
          dojoArray.forEach(this._handles, function (handle) {
            mx.data.unsubscribe(handle);
          });
        }
      },

      // send command to QZ Tray
      _sendCommand: function(){
        var jsonObj = null;
        try {
          //TODO: use JSON attribute given in the widget parameters.
          jsonObj = JSON.parse(this._mxObj.jsonData.attributes.JSON.value);
        } catch(e) {
          console.warn("Failed parsing JSON: " + e.message);
        }
        if (jsonObj !== null) {
          // Automatically gets called when "qz.findPrinter()" is finished.
          window.qzDoneFinding = function(){
            // loop commands
            dojoArray.forEach(jsonObj.commands,function(value,key){
              if (value.hasOwnProperty("chars")) {
                var charsCommand = "";
                dojoArray.forEach(value.chars,function(value,key){
                  charsCommand = charsCommand + window.qzLib.chr(value);
                });
                window.qz.append(charsCommand);
              } else if (value.hasOwnProperty("append")) {
                window.qz.append(value.append);
              }
            });
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
      _addSubscriptions: function(){

          if (this._mxObj !== null){
            var jsonEntitySubscription = mx.data.subscribe({
              guid: this._mxObj.getGUID(),
              callback: lang.hitch(this, function (guid) {
                console.log("Recieved change on QZ print command entity: " + guid);
                mx.data.get({
                  guid: guid,
                  callback: function(obj){
                    this._mxObj = obj;
                  },
                  error: function(e){
                    if(e){
                      console.warn(e.description);
                    }
                  }
                },this);
                this._sendCommand();
              })
            });
            this._handles.push(jsonEntitySubscription);
          }
        
      },

      // run a mendix microflow
      _execMF: function(obj,mf,cb){
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
                  callback: function (objs) {
                      if (cb) {
                          cb(objs);
                      }
                  },
                  error: function (error) {
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
});