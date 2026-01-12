import setting from "./setting.js";
import message from "./message.js";
import contextMenu from "./contextMenu.js";
import "./captionz.js";

const initPromises = (async function () {
  await setting.init();
  if (!setting.getValue("disableContextMenuOnYtb", false)) {
    contextMenu.createLookupItem();
  }
  globalThis.setting = setting;
})();

chrome.runtime.onInstalled.addListener(async function (details) {
  if ([chrome.runtime.OnInstalledReason.INSTALL].includes(details.reason)) {
    await initPromises;
    chrome.tabs.create({
      url: "https://pnl.dev/captionz?welcome=true",
    });
  }
});

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

chrome.runtime.setUninstallURL(
  "https://docs.google.com/forms/d/e/1FAIpQLSefvnQypm4gtmdSy2UlfRBC8ljyNwJMOxVoCg3N8NbFGPoyYw/viewform"
);
