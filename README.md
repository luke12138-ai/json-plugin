# Standalone JSON Tool

This directory contains a standalone Chrome extension extracted from the JSON tool in the original browser assistant project.

## Included capabilities

- Open the full JSON tool from the toolbar icon
- Auto-detect JSON and JSONP responses on regular web pages
- Auto-inject the formatter UI on detected JSON pages
- Reuse the existing JSON formatting page and CodeMirror-based tooling

## How to load

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select this folder: `json-plugin`

## Main files

- `manifest.json`: standalone extension manifest
- `serviceWorker.js`: opens the tool page and injects formatter assets
- `js/content.js`: lightweight JSON page detector
- `pages/jsonPages.html`: standalone JSON tool page
