module Heartland {
  /**
   * @namespace Heartland.DOM
   */
  export module DOM {
    /**
     * Heartland.DOM.configureField
     *
     * Configures an input field in a single field iFrame.
     *
     * @param {Heartland.HPS} hps
     */
    export function configureField(hps: HPS) {
      document.getElementById('heartland-field').setAttribute('name', hps.field);
    }

    /**
     * Heartland.DOM.makeFrame
     *
     * Creates a single iFrame element with the appropriate defaults.
     *
     * @param {string} name
     * @returns {HTMLIframeElement}
     */
    export function makeFrame(name: string) {
      var frame = document.createElement('iframe');
      frame.id = 'heartland-frame-' + name;
      frame.name = name;
      frame.style.border = '0';
      frame.scrolling = 'no';
      return frame;
    }

    /**
     * Heartland.DOM.addField
     *
     * Adds a DOM `input` node to `formParent` with type `fieldType`, name
     * `fieldName`, and value `fieldValue`.
     *
     * @param {string} formParent
     * @param {string} fieldType
     * @param {string} fieldName
     * @param {string} fieldValue
     */
    export function addField(formParent: string, fieldType: string, fieldName: string, fieldValue: string) {
      var input = document.createElement('input');

      input.setAttribute('type', fieldType);
      input.setAttribute('name', fieldName);
      input.setAttribute('value', fieldValue);

      document.getElementById(formParent).appendChild(input);
    }

    /**
     * Heartland.DOM.setStyle
     *
     * Sets an element's style attribute within a child iframe window.
     *
     * @param {string} elementid
     * @param {string} htmlstyle
     */
    export function setStyle(elementid: string, htmlstyle: string) {
      var el = document.getElementById(elementid);
      if (el) {
        el.setAttribute('style', htmlstyle);
      }
    }

    /**
     * Heartland.DOM.appendStyle
     *
     * Appends an element's style attribute within a child iframe window.
     *
     * @param {string} elementid
     * @param {String} htmlstyle
     */
    export function appendStyle(elementid: string, htmlstyle: string) {
      var el = document.getElementById(elementid);
      if (el) {
        var currstyle = el.getAttribute('style');
        var newstyle = (currstyle ? currstyle : '') + htmlstyle;
        el.setAttribute('style', newstyle);
      }
    }

    /**
     * Heartland.DOM.setText
     *
     * Sets an element's inner text within a child iframe window.
     *
     * @param {string} elementid
     * @param {string} text
     */
    export function setText(elementid: string, text: string) {
      var el = document.getElementById(elementid);
      if (el) {
        el.innerHTML = text;
      }
    }

    /**
     * Heartland.DOM.setPlaceholder
     *
     * Sets an element's placeholder attribute within a child iframe window.
     *
     * @param {string} elementid
     * @param {string} text
     */
    export function setPlaceholder(elementid: string, text: string) {
      var el = document.getElementById(elementid);
      if (el) {
        el.setAttribute('placeholder', text);
      }
    }

    /**
     * Heartland.DOM.resizeFrame
     *
     * Alerts a parent window to resize the iframe.
     *
     * @param {Heartland.HPS} hps
     */
    export function resizeFrame(hps: HPS) {
      var html = document.getElementsByTagName('html')[0];
      var docHeight = html.offsetHeight;
      hps.Messages.post({ action: 'resize', height: docHeight }, 'parent');
    }

    /**
     * Heartland.DOM.setFieldData
     *
     * Receives a field value from another frame prior to the tokenization process.
     *
     * @param {string} elementid
     * @param {string} value
     */
    export function setFieldData(elementid: string, value: string) {
      var el = document.getElementById(elementid);
      if (!el && document.getElementById('heartland-field')) {
        el = document.createElement('input');
        el.setAttribute('id', elementid);
        el.setAttribute('type', 'hidden');
        document.getElementById('heartland-field-wrapper').appendChild(el);
      }

      if (el) {
        el.setAttribute('value', value);
      }
    }

    /**
     * Heartland.DOM.getFieldData
     *
     * Retrieves a field value for another frame prior to the tokenization process.
     *
     * @param {Heartland.HPS} hps
     * @param {string} elementid
     */
    export function getFieldData(hps: HPS, elementid: string) {
      var el: HTMLInputElement = <HTMLInputElement>document.getElementById(elementid);
      if (el) {
        hps.Messages.post({ action: 'passData', value: el.value }, 'parent');
      }
    }
  }
}