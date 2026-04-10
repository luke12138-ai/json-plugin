const JSON_AUTO_FORMAT_CSS = [
  "css/tipTip.css",
  "css/jsonAutoFormat.css",
  "vendor/codemirror/lib/codemirror.css",
  "vendor/codemirror/addon/fold/foldgutter.css",
  "vendor/codemirror/addon/dialog/dialog.css",
  "vendor/codemirror/addon/search/matchesonscrollbar.css",
  "vendor/codemirror/addon/scroll/simplescrollbars.css",
  "vendor/codemirror/theme/default.css"
];

const JSON_AUTO_FORMAT_JS = [
  "vendor/codemirror/lib/codemirror.min.js",
  "vendor/codemirror/addon/fold/foldcode.js",
  "vendor/codemirror/addon/fold/foldgutter.js",
  "vendor/codemirror/addon/fold/brace-fold.js",
  "vendor/codemirror/addon/dialog/dialog.js",
  "vendor/codemirror/addon/selection/active-line.js",
  "vendor/codemirror/addon/scroll/simplescrollbars.js",
  "vendor/codemirror/addon/scroll/annotatescrollbar.js",
  "vendor/codemirror/mode/javascript/javascript.js",
  "vendor/codemirror/addon/search/matchesonscrollbar.js",
  "vendor/codemirror/addon/search/search.js",
  "vendor/codemirror/addon/search/searchcursor.js",
  "vendor/codemirror/addon/search/jump-to-line.js",
  "js/jquery-3.5.1.min.js",
  "js/jquery.tipTip.minified.js",
  "js/jsonAutoFormat.js"
];

async function injectJsonFormatter(tabId) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: JSON_AUTO_FORMAT_CSS
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: JSON_AUTO_FORMAT_JS
  });
}

chrome.action.onClicked.addListener(async () => {
  await chrome.tabs.create({
    url: chrome.runtime.getURL("pages/jsonPages.html"),
    active: true
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.handler !== "jsonPageFormat" || !sender.tab?.id) {
    return;
  }

  injectJsonFormatter(sender.tab.id).catch((error) => {
    console.error("Failed to inject JSON formatter", error);
  });
});
