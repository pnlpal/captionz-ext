import setting from "./setting.js";
import message from "./message.js";
import contextMenu from "./contextMenu.js";
import "./captionz.js";

const initPromises = (async function () {
  await setting.init();
  globalThis.setting = setting;
})();

// chrome.runtime.onInstalled.addListener(async function (details) {
//   if ([chrome.runtime.OnInstalledReason.INSTALL].includes(details.reason)) {
//     await initPromises;
//     chrome.tabs.create({
//       url: chrome.runtime.getURL("share.html"),
//     });
//   }
// });

chrome.runtime.onMessage.addListener(function (...args) {
  initPromises.then(() => {
    message.handle(...args);
  });
  // sendResponse becomes invalid when the event listener returns,
  // unless you return true from the event listener to indicate you wish to send a response asynchronously
  return true;
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  await initPromises;
  contextMenu.handler(info, tab);
});

// chrome.runtime.setUninstallURL("https://forms.gle/9Jmz1d7PtxqMzSNq5");
