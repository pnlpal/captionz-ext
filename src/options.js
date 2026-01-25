// Load saved settings
function loadSettings() {
  chrome.runtime.sendMessage({ type: "setting" }, function (settings) {
    if (settings) {
      document.getElementById("disableContextMenuOnYtb").checked =
        settings.disableContextMenuOnYtb || false;
      document.getElementById("disableCaptionzBtnOnYtb").checked =
        settings.disableCaptionzBtnOnYtb || false;
    }
  });
}

// Save individual setting
function saveSetting(key, value) {
  chrome.runtime.sendMessage(
    {
      type: "save setting",
      key: key,
      value: value,
    },
    function (response) {
      // Show save confirmation
      const saveStatus = document.getElementById("saveStatus");
      saveStatus.classList.add("show", "success");

      setTimeout(function () {
        saveStatus.classList.remove("show");
      }, 2000);
    },
  );
}

// Add event listeners
document.addEventListener("DOMContentLoaded", function () {
  loadSettings();

  document
    .getElementById("disableContextMenuOnYtb")
    .addEventListener("change", function (e) {
      saveSetting("disableContextMenuOnYtb", e.target.checked);
    });

  document
    .getElementById("disableCaptionzBtnOnYtb")
    .addEventListener("change", function (e) {
      saveSetting("disableCaptionzBtnOnYtb", e.target.checked);
    });
});
