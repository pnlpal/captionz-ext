export default {
  handler: (info, tab) => {
    if (info.menuItemId === "watch on captionz") {
    }
  },
  createLookupItem: () => {
    chrome.contextMenus.create({
      id: "watch on captionz",
      title: `Watch this video on Captionz`,
      contexts: ["link"],
    });
  },
  removeLookupItem: () => {
    chrome.contextMenus.remove("watch on captionz");
  },
};
