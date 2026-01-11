import contextMenu from "./contextMenu.js";
import message from "./message.js";

export default {
  configCache: {
    disableContextMenuOnYtb: false,
    disableCaptionzBtnOnYtb: false,
  },

  init() {
    message.on("setting", () => {
      return this.configCache;
    });
    message.on("save setting", (request) => {
      if (request.key === "disableContextMenuOnYtb") {
        if (request.value) {
          contextMenu.removeLookupItem();
        } else {
          contextMenu.createLookupItem();
        }
      }
      return this.setValue(request.key, request.value);
    });

    return new Promise((resolve) => {
      chrome.storage.sync.get("config", (obj) => {
        if (obj && obj.config) {
          Object.assign(this.configCache, obj.config);
        }
        resolve(this.configCache);
      });
    });
  },

  async setValue(key, value) {
    if (this.configCache[key] !== value) {
      this.configCache[key] = value;
      await chrome.storage.sync.set({ config: this.configCache });
    }
    return value;
  },

  getValue(key, defaultValue) {
    var v = this.configCache[key];
    v = v !== undefined ? v : defaultValue;
    return v;
  },

  clear() {
    return new Promise((resolve) => {
      chrome.storage.sync.remove("config", resolve);
    });
  },
};
