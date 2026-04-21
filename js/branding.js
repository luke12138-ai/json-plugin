(function () {
  const BRAND_ICON = chrome.runtime.getURL("images/icon-logo-json.png");
  const TOOLBAR_SELECTOR = ".controll-view";

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
    const anchors = root.querySelectorAll(`${TOOLBAR_SELECTOR} .logo-img-view a`);
    anchors.forEach(unwrapLink);

    root.querySelectorAll(`${TOOLBAR_SELECTOR} .logo-img-view img`).forEach((img) => {
      img.src = BRAND_ICON;
    });
  }

  function startCleanup() {
    cleanupPluginLinks(document);

    const observer = new MutationObserver(() => {
      cleanupPluginLinks(document);
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startCleanup, { once: true });
  } else {
    startCleanup();
  }
})();
