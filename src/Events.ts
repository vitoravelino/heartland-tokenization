/// <reference path="types/CardData.ts" />
/// <reference path="DOM.ts" />
/// <reference path="HPS.ts" />

module Heartland {
  /**
   * @namespace Heartland.Events
   */
  export module Events {
    class Ev {
      static listen(node: EventTarget, eventName: string, callback: EventListener) {
        if (document.addEventListener) {
          node.addEventListener(eventName, callback, false);
        } else {
          if (node === document) {
            (<any>document.documentElement).attachEvent('onpropertychange', function (e: Event) {
              if ((<any>e).propertyName === eventName) {
                callback(e);
              }
            });
          } else {
            (<any>node).attachEvent('on' + eventName, callback);
          }
        }
      }
      static trigger(node: EventTarget, eventName: string) {
        if (document.createEvent) {
          var event = document.createEvent('Event');
          event.initEvent(eventName, true, true);
          node.dispatchEvent(event);
        } else {
          (<any>document.documentElement)[eventName]++;
        }
      }
      static ignore(eventName: string, callback: EventListener) {
        if (document.removeEventListener) {
          document.removeEventListener(eventName, callback, false);
        } else {
          (<any>document.documentElement).detachEvent('onpropertychange', function (e: Event) {
            if ((<any>e).propertyName === eventName) {
              callback(e);
            }
          });
        }
      }
    }

    /**
     * Heartland.Events.addHandler
     *
     * Adds an `event` handler for a given `target` element.
     *
     * @param {string | EventTarget} target
     * @param {string} event
     * @param {EventListener} callback
     */
    export function addHandler(target: string | EventTarget, event: string, callback: EventListener) {
      var node: EventTarget;
      if (typeof target === 'string') {
        node = document.getElementById(<string>target);
      } else {
        node = target;
      }

      if (document.addEventListener) {
        node.addEventListener(event, callback, false);
      } else {
        Ev.listen(node, event, callback);
      }
    }

    /**
     * Heartland.Events.removeHandler
     *
     * Removes an `event` handler for a given `target` element.
     *
     * @param {string | EventTarget} target
     * @param {string} event
     * @param {EventListener} callback
     */
    export function removeHandler(target: string | EventTarget, event: string, callback: EventListener) {
      var node: EventTarget;
      if (typeof target === 'string') {
        node = document.getElementById(<string>target);
      } else {
        node = target;
      }

      if (document.removeEventListener) {
        node.removeEventListener(event, callback, false);
      } else {
        Ev.ignore(event, callback);
      }
    }

    /**
     * Heartland.Events.trigger
     *
     * Fires off an `event` for a given `target` element.
     *
     * @param {string} name
     * @param {any} target
     * @param {any} data [optional]
     */
    export function trigger(name: string, target: any, data?: any, bubble = false) {
      var event: any;

      if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent(name, true, true);
        target.dispatchEvent(event);
      } else {
        Ev.trigger(target, name);
      }
    }

    /**
     * Heartland.Events.frameHandleWith
     *
     * Wraps `hps` state in a closure to provide a `Heartland.Messages.receive`
     * callback handler for iFrame children.
     *
     * @param {Heartland.HPS} hps
     */
    export function frameHandleWith(hps: HPS) : (m: any) => void {
      return function(m) {
        var data = JSON.parse(m.data);
        switch (data.action) {
          case 'tokenize':
            if (data.accumulateData) {
              hps.Messages.post(
                {
                  action: 'accumulateData'
                },
                'parent'
                );
              var el = document.createElement('input');
              el.id = 'publicKey';
              el.type = 'hidden';
              el.value = data.message;
              document
                .getElementById('heartland-field-wrapper')
                .appendChild(el);
            } else {
              tokenizeIframe(hps, data.message);
            }
            break;
          case 'setStyle':
            Heartland.DOM.setStyle(data.id, data.style);
            Heartland.DOM.resizeFrame(hps);
            break;
          case 'appendStyle':
            Heartland.DOM.appendStyle(data.id, data.style);
            Heartland.DOM.resizeFrame(hps);
            break;
          case 'setText':
            Heartland.DOM.setText(data.id, data.text);
            Heartland.DOM.resizeFrame(hps);
            break;
          case 'setPlaceholder':
            Heartland.DOM.setPlaceholder(data.id, data.text);
            break;
          case 'setFieldData':
            Heartland.DOM.setFieldData(data.id, data.value);
            if (document.getElementById('heartland-field') &&
              document.getElementById('cardCvv') &&
              document.getElementById('cardExpiration')) {
              var pkey = document.getElementById('publicKey');
              tokenizeIframe(hps, (pkey ? pkey.getAttribute('value') : ''));
            }
            break;
          case 'getFieldData':
            Heartland.DOM.getFieldData(hps, data.id);
            break;
          case 'addStylesheet':
            Heartland.DOM.addStylesheet(data.data);
            Heartland.DOM.resizeFrame(hps);
            break;
          case 'setFocus':
            Heartland.DOM.setFocus();
            break;
        }
      };
    }

    /**
     * tokenizeIframe
     *
     * Tokenizes card data. Used in iframe integrations to tokenize on Heartland's
     * servers.
     *
     * @param {Heartland.HPS} hps
     * @param {string} publicKey
     */
    function tokenizeIframe(hps: HPS, publicKey: string) {
      var card: CardData = {};
      var numberElement = <HTMLInputElement>(document.getElementById('heartland-field')
                                             || document.getElementById('heartland-card-number'));
      var cvvElement = <HTMLInputElement>(document.getElementById('cardCvv')
                                          || document.getElementById('heartland-cvv'));
      var expElement = document.getElementById('cardExpiration');
      var tokenResponse = (action: string) => {
        return (response: TokenizationResponse) => {
          hps.Messages.post({action: action, response: response}, 'parent');
          if (cvvElement) {
            if (cvvElement.parentNode) {
              cvvElement.parentNode.removeChild(cvvElement);
            } else {
              cvvElement.remove();
            }
          }
          if (expElement) {
            if (expElement.parentNode) {
              expElement.parentNode.removeChild(expElement);
            } else {
              expElement.remove();
            }
          }
        };
      };

      card.number = numberElement ? numberElement.value : '';
      card.cvv = cvvElement ? cvvElement.value : '';
      card.exp = expElement;

      if (card.exp) {
        var cardExpSplit = (<HTMLInputElement>card.exp).value.split('/');
        card.expMonth = cardExpSplit[0];
        card.expYear = cardExpSplit[1];
        card.exp = undefined;
      } else {
        card.expMonth = (<HTMLInputElement>document.getElementById('heartland-expiration-month')).value;
        card.expYear = (<HTMLInputElement>document.getElementById('heartland-expiration-year')).value;
      }

      hps.tokenize({
        cardCvv: card.cvv ? card.cvv : '',
        cardExpMonth: card.expMonth ? card.expMonth : '',
        cardExpYear: card.expYear ? card.expYear : '',
        cardNumber: card.number ? card.number : '',
        error: tokenResponse('onTokenError'),
        publicKey: publicKey ? publicKey : '',
        success: tokenResponse('onTokenSuccess'),
        type: 'pan'
      });
    }
  }
}

