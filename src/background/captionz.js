import message from "./message.js";

const openYtbOnCaptionz = (link) => {
  const url =  link ? `https://pnl.dev/captionz?link=${encodeURIComponent(link)}` : "https://pnl.dev/captionz";
  chrome.tabs.create({ url });
};

message.on("open video on captionz", ({ link }) => {
  if (link.startsWith("https://www.youtube.com/watch")) {
    openYtbOnCaptionz(link);
  }
});

export { openYtbOnCaptionz };
