(function () {
  const DEFAULT_JSON_CONFIG = {
    autoFormatJSONPage: true
  };
  const HOTKEY_SEQUENCE = "cc";
  const HOTKEY_TIMEOUT = 700;
  const BRAND_ICON_URL = chrome.runtime.getURL("images/icon-logo-json.png");

  let hotkeyBuffer = "";
  let lastHotkeyAt = 0;

  function parseStoredValue(value) {
    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  function getJsonConfig(callback) {
    chrome.storage.local.get(["jsonConfig"], (result) => {
      const stored = parseStoredValue(result.jsonConfig) || {};
      callback(Object.assign({}, DEFAULT_JSON_CONFIG, stored));
    });
  }

  function extractJSON(rawJson) {
    return rawJson
      .replace(/\s*while\((1|true)\)\s*;?/, "")
      .replace(/\s*for\(;;\)\s*;?/, "")
      .replace(/^[^{\[].+\(\s*?{/, "{")
      .replace(/}\s*?\);?\s*$/, "}");
  }

  function isJSON(jsonStr) {
    let str = jsonStr;
    if (!str || str.length === 0) {
      return false;
    }

    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@");
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]");
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, "");
    return /^[\],:{}\s]*$/.test(str);
  }

  function isJSONP(jsonStr) {
    return isJSON(extractJSON(jsonStr));
  }

  function allTextNodes(nodes) {
    return !Object.keys(nodes).some((key) => nodes[key].nodeName !== "#text");
  }

  function getPreWithSource() {
    if (!document || !document.body) {
      return null;
    }

    const childNodes = document.body.childNodes;
    if (childNodes.length === 0) {
      return null;
    }

    if (childNodes.length > 1 && allTextNodes(childNodes)) {
      document.body.normalize();
    }

    const childNode = childNodes[0];
    const nodeName = childNode.nodeName;
    const textContent = childNode.textContent;
    const isEdge = navigator.userAgent.indexOf("Edg") > -1;

    if (nodeName === "PRE" || (isEdge && nodeName === "DIV" && childNode.getAttribute("hidden") === "true")) {
      return childNode;
    }

    if (nodeName === "#text" && textContent.trim().length > 0) {
      const pre = document.createElement("pre");
      pre.textContent = textContent;
      return pre;
    }

    return null;
  }

  function checkIfJson() {
    const pre = getPreWithSource();
    return !!pre && (isJSON(pre.textContent) || isJSONP(pre.textContent));
  }

  function tryAutoFormat() {
    getJsonConfig((jsonConfig) => {
      if (jsonConfig.autoFormatJSONPage === false) {
        return;
      }

      if (checkIfJson()) {
        chrome.runtime.sendMessage({ handler: "jsonPageFormat" });
      }
    });
  }

  function isEditableTarget(target) {
    if (!target) {
      return false;
    }

    if (target.isContentEditable) {
      return true;
    }

    const editableParent = typeof target.closest === "function"
      ? target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")
      : null;

    return !!editableParent;
  }

  function resetHotkeyState() {
    hotkeyBuffer = "";
    lastHotkeyAt = 0;
  }

  function unwrapLink(anchor) {
    if (!anchor || !anchor.parentNode) {
      return;
    }

    while (anchor.firstChild) {
      anchor.parentNode.insertBefore(anchor.firstChild, anchor);
    }
    anchor.remove();
  }

  function cleanupPluginLinks(root = document) {
    const anchors = root.querySelectorAll("a[href*='plugin.csdn.net']");
    anchors.forEach(unwrapLink);

    root.querySelectorAll(".logo-img-view img, .logo-img, img.logo").forEach((img) => {
      img.src = BRAND_ICON_URL;
    });
  }

  function observeBrandingCleanup() {
    cleanupPluginLinks(document);

    const observer = new MutationObserver(() => {
      cleanupPluginLinks(document);
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  function openJsonToolPopup() {
    const url = chrome.runtime.getURL("pages/jsonPages.html");
    const width = Math.min(1200, Math.max(960, Math.floor(window.screen.availWidth * 0.75)));
    const height = Math.min(820, Math.max(640, Math.floor(window.screen.availHeight * 0.8)));
    const left = Math.max(0, Math.floor((window.screen.availWidth - width) / 2));
    const top = Math.max(0, Math.floor((window.screen.availHeight - height) / 2));

    window.open(
      url,
      "standalone-json-tool",
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  function handleSequenceHotkey(event) {
    if (event.defaultPrevented || event.repeat) {
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      resetHotkeyState();
      return;
    }

    if (isEditableTarget(event.target)) {
      resetHotkeyState();
      return;
    }

    const key = (event.key || "").toLowerCase();
    if (key.length !== 1) {
      resetHotkeyState();
      return;
    }

    const now = Date.now();
    if (now - lastHotkeyAt > HOTKEY_TIMEOUT) {
      hotkeyBuffer = "";
    }
    lastHotkeyAt = now;

    if (key === HOTKEY_SEQUENCE[hotkeyBuffer.length]) {
      hotkeyBuffer += key;
      if (hotkeyBuffer === HOTKEY_SEQUENCE) {
        resetHotkeyState();
        event.preventDefault();
        event.stopPropagation();
        openJsonToolPopup();
      }
      return;
    }

    hotkeyBuffer = key === HOTKEY_SEQUENCE[0] ? key : "";
  }

  window.addEventListener("keydown", handleSequenceHotkey, true);
  observeBrandingCleanup();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryAutoFormat, { once: true });
  } else {
    tryAutoFormat();
  }
})();
