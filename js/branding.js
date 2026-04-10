(function () {
  const BRAND_ICON = chrome.runtime.getURL("images/icon-logo-json.png");

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
