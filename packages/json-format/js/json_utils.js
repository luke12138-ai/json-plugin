/* eslint-disable  */

// eslint-disable-next-line no-global-assign
if (typeof global === 'undefined') {
  global = window;
}
if (!global.JSONUtils) global.JSONUtils = {};

var _jsonUtils = {
  extractJSON: function(rawJson) {
    return rawJson
      .replace(/\s*while\((1|true)\)\s*;?/, '')
      .replace(/\s*for\(;;\)\s*;?/, '')
      .replace(/^[^{\[].+\(\s*?{/, '{')
      .replace(/}\s*?\);?\s*$/, '}');
  },
  removeQuote: function(json) {
    return json
      .replace(/\s+/g, '')
      .replace(/<\/?.+?>/g, '')
      .replace(/[\r\n]/g, '');
  },
  isJSON: function(jsonStr) {
    var str = jsonStr;
    if (!str || str.length === 0) {
      return false;
    }
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return /^[\],:{}\s]*$/.test(str);
  },
  isJSONP: function(jsonStr) {
    return this.isJSON(this.extractJSON(jsonStr));
  },
  allTextNodes(nodes) {
    return !Object.keys(nodes).some(function(key) {
      return nodes[key].nodeName !== '#text';
    });
  },
  getPreWithSource() {
    if (!document || !document.body) return null;

    var childNodes = document.body.childNodes;
    if (childNodes.length === 0) {
      return null;
    }
    // 如果节点大于1 && 都是文本节点
    if (childNodes.length > 1 && this.allTextNodes(childNodes)) {
      // 合并相邻的文本节点并删除空的文本节点
      document.body.normalize();
    }
    var childNode = childNodes[0];
    var nodeName = childNode.nodeName;
    var textContent = childNode.textContent;
    var isEdg = navigator.userAgent.indexOf('Edg') > -1;
    // 如果是Pre直接返回节点
    if (nodeName === 'PRE' || (isEdg && nodeName === 'DIV' && childNode.getAttribute('hidden') === 'true')) {
      return childNode;
    }
    // if Content-Type is text/html
    if (nodeName === '#text' && textContent.trim().length > 0) {
      var pre = document.createElement('pre');
      pre.textContent = textContent;
      return pre;
    }
    return null;
  },
  checkIfJson(element) {
    var pre = element || this.getPreWithSource();
    if (pre !== null && pre !== undefined && (this.isJSON(pre.textContent) || this.isJSONP(pre.textContent))) {
      return true;
    }
    return false;
  },
};

Object.assign(global.JSONUtils, _jsonUtils);
