const setYtb = async () => {
  if (document.getElementById("captionz-ytb-btn")) {
    return;
  }
  const sbtn = '<a href="" id="captionz-ytb-btn">Watch on Captionz</a>';

  await utils.checkInTime(() => !!document.getElementById("above-the-fold"));

  const container = document.getElementById("above-the-fold");
  if (container) {
    container.insertAdjacentHTML("afterbegin", sbtn);

    const btn = document.getElementById("captionz-ytb-btn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        utils.send("open video on captionz", {
          link: location.href,
        });
      });
    }
  }
};

const observePathnameChange = (callback) => {
  let lastPathname = location.pathname;
  const observer = new MutationObserver((mutations) =>
    mutations.forEach((mutation) => {
      if (location.pathname !== lastPathname) {
        lastPathname = location.pathname;
        callback();
      }
    })
  );
  observer.observe(document, { subtree: true, childList: true });
};

(async () => {
  const { disableCaptionzBtnOnYtb } = await utils.send("setting");
  if (!disableCaptionzBtnOnYtb) {
    if (
      location.href.startsWith("https://www.youtube.com/watch") &&
      location.search.includes("v=") &&
      window.self === window.top
    ) {
      setYtb().catch(console.warn);
    }

    observePathnameChange(() => {
      if (
        location.href.startsWith("https://www.youtube.com/watch") &&
        location.search.includes("v=") &&
        window.self === window.top
      ) {
        setYtb().catch(console.warn);
      }
    });
  }
})();
