/**
 * addEventListener polyfill for IE<9
 */
 'use strict';

 (function () {

  // abort loading if window is undefined (node environment)
  if (typeof window === 'undefined') { return; }

  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault = function () {
      this.returnValue = false;
    };
  }
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation = function () {
      this.cancelBubble = true;
    };
  }
  if (!Element.prototype.addEventListener) {
    var eventListeners = [];
    var addEventListener = function (type, listener) {
      var self = this;
      var wrapper = function (e) {
        e.target = e.srcElement;
        e.currentTarget = self;
        listener.call(self, e);
      };
      this.attachEvent('on' + type, wrapper);
      eventListeners.push({
        'object': this,
        'type': type,
        'listener': listener,
        'wrapper': wrapper
      });
    };
    var removeEventListener = function (type, listener) {
      var i = -1, len = eventListeners.length;
      while (++i < len) {
        var eventListener = eventListeners[i];
        if (eventListener.object === this && eventListener.type === type && eventListener.listener === listener) {
          this.detachEvent('on' + type, eventListener.wrapper);
          eventListeners.splice(i, 1);
          break;
        }
      }
    };
    var dispatchEvent = function (event) {
      this.fireEvent('on' + event.type, event);
    };
    Element.prototype.addEventListener = addEventListener;
    Element.prototype.removeEventListener = removeEventListener;
    Element.prototype.dispatchEvent = dispatchEvent;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener = addEventListener;
      HTMLDocument.prototype.removeEventListener = removeEventListener;
      HTMLDocument.prototype.dispatchEvent = dispatchEvent;
    }
    if (Window) {
      Window.prototype.addEventListener = addEventListener;
      Window.prototype.removeEventListener = removeEventListener;
      Window.prototype.dispatchEvent = dispatchEvent;
    }
  }
})();
