// src/content.js
(function () {
  const isInIframe = window.location !== window.parent.location;
  if (!isInIframe) {
    return;
  }

  // --- 1. Intercept Fetch ---
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    const url = args[0]
      ? typeof args[0] === "string"
        ? args[0]
        : args[0].url
      : "";

    if (isCaptionUrl(url)) {
      const clone = response.clone();
      try {
        clone
          .json()
          .then((data) => {
            handleCaptionData(data, url, "json");
          })
          .catch(() => {
            const clone2 = response.clone();
            clone2.text().then((text) => {
              handleCaptionData(text, url, "text");
            });
          });
      } catch (err) {
        console.error("[Captionz-ext] Error cloning/parsing response", err);
      }
    }

    return response;
  };

  // --- 2. Intercept XMLHttpRequest (XHR) ---
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      if (this._url && isCaptionUrl(this._url)) {
        let type = "text";
        let data = this.responseText;

        try {
          // Attempt to parse JSON if it looks like it
          if (
            (this.getResponseHeader("content-type") || "").includes(
              "application/json"
            ) ||
            data.trim().startsWith("{")
          ) {
            data = JSON.parse(data);
            type = "json";
          }
        } catch (e) {
          // ignore error, treat as text
        }

        handleCaptionData(data, this._url, type);
      }
    });

    return originalSend.apply(this, arguments);
  };

  function isCaptionUrl(url) {
    return (
      url &&
      (url.includes("/api/timedtext") ||
        url.includes("/youtubei/v1/get_transcript") ||
        url.includes("/youtubei/v1/player"))
    );
  }

  let cachedVideoInfo = null;

  function handleCaptionData(data, url, type) {
    // 1. Handle Video Info (from player endpoint)
    if (data && data.videoDetails) {
      processVideoDetails(data.videoDetails, data);
    }

    // 2. Handle Captions
    if (
      url.includes("/api/timedtext") ||
      url.includes("/youtubei/v1/get_transcript")
    ) {
      console.log("[Captionz-ext] Intercepted captions:", type, url);

      // Ensure we have video info
      if (!cachedVideoInfo) {
        extractVideoInfoFromDOM();
      }

      let languageCode = null;
      let languageName = null;
      let trackKind = null;

      try {
        const u = new URL(url);
        languageCode = u.searchParams.get("tlang");
        trackKind = u.searchParams.get("kind");
      } catch (e) {}

      if (languageCode && cachedVideoInfo?.captionTracks) {
        // Try to find exact match including kind
        let track = null;
        if (trackKind) {
          track = cachedVideoInfo.captionTracks.find(
            (t) => t.languageCode === languageCode && t.kind === trackKind
          );
        }

        // Fallback to just language match
        if (!track) {
          track = cachedVideoInfo.captionTracks.find(
            (t) => t.languageCode === languageCode
          );
        }

        if (track) {
          languageName = track.name?.simpleText || track.name?.runs?.[0]?.text;
          if (!trackKind) trackKind = track.kind;
        }
      }

      // Try reading from DOM player API
      if (!languageCode || !languageName) {
        try {
          const player = document.getElementById("movie_player");
          if (player && typeof player.getOption === "function") {
            const track = player.getOption("captions", "track");
            if (track?.translationLanguage) {
              languageCode = track.translationLanguage.languageCode;
              languageName = track.translationLanguage.languageName;
              trackKind = "translation";
            } else if (track) {
              languageCode = track.languageCode;
              trackKind = track.kind || trackKind;
              languageName = track.languageName;
            }
          }
        } catch (e) {}
      }

      const captionEvent = {
        timestamp: Date.now(),
        url: url,
        type: type,
        data: data,
        videoInfo: cachedVideoInfo,
        languageCode,
        languageName,
        trackKind,
      };

      console.log(
        "[Captionz-ext] Posting caption event to window.parent:",
        captionEvent
      );
      console.log(
        `[Captionz-ext] title: ${cachedVideoInfo?.title}, language: ${languageName} (${languageCode})`
      );
      window.parent.postMessage(
        {
          source: "CAPTIONZ_EXTENSION",
          payload: captionEvent,
        },
        "*"
      );
    }
  }

  function processVideoDetails(details, fullData) {
    const thumbnails = details.thumbnail?.thumbnails || [];
    const snapshot =
      thumbnails.length > 0
        ? thumbnails[thumbnails.length - 1].url
        : `https://i.ytimg.com/vi/${details.videoId}/hqdefault.jpg`;

    let captionTracks =
      fullData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

    let defaultAudioLanguage = (() => {
      if (captionTracks.length > 0) {
        const tracks = captionTracks;
        const asr = tracks.find((t) => t.kind === "asr");
        if (asr) {
          return asr.languageCode;
        } else if (tracks.length > 0) {
          return tracks[0].languageCode;
        }
      }
    })();

    cachedVideoInfo = {
      videoId: details.videoId,
      title: details.title,
      snapshot: snapshot,
      shortDescription: details.shortDescription || "",
      author: details.author,
      channelId: details.channelId,
      defaultAudioLanguage: defaultAudioLanguage || null,
      captionTracks: captionTracks,
    };

    console.log("[Captionz-ext] Updated cached video info:", cachedVideoInfo);
  }

  function extractVideoInfoFromDOM() {
    // 1. Try movie_player API (Official Player API)
    const player = document.getElementById("movie_player");
    if (player && typeof player.getPlayerResponse === "function") {
      try {
        const playerResponse = player.getPlayerResponse();
        if (playerResponse && playerResponse.videoDetails) {
          processVideoDetails(playerResponse.videoDetails, playerResponse);
          return; // Success
        }
      } catch (e) {
        console.error("[Captionz-ext] Error calling getPlayerResponse:", e);
      }
    }

    // Fallback: Scrape DOM if network intercept hasn't fired or globals are missing
    try {
      // YouTube standard standard meta tags
      const videoIdMatch = window.location.search.match(/v=([^&]+)/);
      // For embedded players, videoId might be in the path /embed/VIDEO_ID
      const embedMatch = window.location.pathname.match(/\/embed\/([^\/]+)/);

      const videoId =
        (videoIdMatch && videoIdMatch[1]) || (embedMatch && embedMatch[1]);

      if (!videoId) return;

      const title =
        document.title ||
        document.querySelector('meta[name="title"]')?.content ||
        document.querySelector(".ytp-title-link")?.textContent;

      // Try to find image
      const image =
        document.querySelector('meta[property="og:image"]')?.content ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const description =
        document.querySelector('meta[name="description"]')?.content || "";

      const channelId =
        document.querySelector('meta[itemprop="channelId"]')?.content || "";

      const defaultAudioLanguage =
        document.querySelector('meta[itemprop="inLanguage"]')?.content || "";

      cachedVideoInfo = {
        videoId: videoId,
        title: title || "Unknown Title",
        snapshot: image,
        shortDescription: description,
        author: "", // Can't easily scrape author from bare DOM in embed sometimes
        channelId: channelId,
        defaultAudioLanguage: defaultAudioLanguage,
      };

      console.log(
        "[Captionz-ext] Updated cached video info from DOM:",
        cachedVideoInfo
      );
    } catch (e) {
      console.error("[Captionz-ext] DOM scraping failed", e);
    }
  }

  // Attempt DOM extraction on load as a fallback
  window.addEventListener("load", extractVideoInfoFromDOM);
  // Also try immediately
  extractVideoInfoFromDOM();

  // --- 4. Listen for messages from Captionz App ---
  window.addEventListener("message", function (event) {
    if (
      event.data &&
      event.data.source === "CAPTIONZ_APP" &&
      event.data.command === "openAutoTranslate"
    ) {
      openAutoTranslatePanel();
    }
  });

  function openAutoTranslatePanel() {
    const settingsBtn = document.querySelector(
      ".ytp-settings-button, .player-settings-icon"
    );
    if (settingsBtn) {
      settingsBtn.click();
      setTimeout(() => {
        const menuItems = document.querySelectorAll(
          ".ytp-menuitem, .yt-list-item-view-model__container"
        );
        let subtitlesClicked = false;
        for (const item of menuItems) {
          const label = item.querySelector(
            ".ytp-menuitem-label, .yt-list-item-view-model__text-wrapper"
          );
          if (
            label &&
            (label.textContent.includes("Subtitles") ||
              label.textContent.includes("Captions") ||
              label.textContent.includes("CC"))
          ) {
            item.click();
            subtitlesClicked = true;
            break;
          }
        }

        if (subtitlesClicked) {
          showSignal("Please select 'Auto-translate' in the menu.");
          setTimeout(() => {
            const subMenuItems = document.querySelectorAll(
              ".ytp-menuitem, .yt-list-item-view-model__container"
            );
            for (const item of subMenuItems) {
              if (item.textContent.includes("Auto-translate")) {
                item.style.outline = "2px solid green"; // Highlight
                item.click();
                showSignal(
                  "Please select your desired language for Auto-translate."
                );
                break;
              }
            }
          }, 300);
        } else {
          showSignal(
            "Please play the video and enable captions first.",
            "goldenrod",
            5
          );
          settingsBtn.click(); // Close settings
        }
      }, 300);
    } else {
      showSignal(
        "Please enable captions in the YouTube player manually.",
        "goldenrod",
        5
      );
    }
  }

  function showSignal(msg, textColor = "#fff", seconds = 3) {
    const div = document.createElement("div");
    div.innerText = msg;
    div.style.position = "fixed";
    div.style.top = "25%";
    div.style.left = "50%";
    div.style.transform = "translateX(-50%)";
    div.style.backgroundColor = "rgba(0,0,0,0.9)";
    div.style.color = textColor;
    div.style.padding = "25px 40px";
    div.style.borderRadius = "15px";
    div.style.zIndex = "2147483647";
    div.style.fontSize = "28px";
    div.style.fontWeight = "bold";
    div.style.fontFamily = "sans-serif";
    div.style.textAlign = "center";
    div.style.boxShadow = "0 5px 25px rgba(0,0,0,0.5)";
    div.style.border = "2px solid rgba(255,255,255,0.2)";
    div.style.pointerEvents = "none";
    div.style.transition = "opacity 0.5s";
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 500);
    }, seconds * 1000);
  }

  console.log("[Captionz-ext] Main world script loaded. fetch() intercepted.");
})();
