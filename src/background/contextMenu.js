import { openYtbOnCaptionz } from "./captionz.js";

export default {
  handler: (info, tab) => {
    if (info.menuItemId === "watch on captionz") {
      const link = info.linkUrl;
      // https://www.youtube.com/watch?v=xxxxx
      if (link && link.includes("youtube.com/watch") && link.includes("v=")) {
        openYtbOnCaptionz(link);
      }
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
