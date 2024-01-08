(function () {
  let containersByTab = {};
  let requestTiming = {};
  let pageLoadTiming = null;
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (
        details.type === "script" &&
        details.url.includes("https://www.googletagmanager.com/gtm.js")
      ) {
        requestTiming[details.requestId] = {
          startTime: performance.now(),
        };
      }
    },
    { urls: ["<all_urls>"] }
  );
  chrome.webRequest.onCompleted.addListener(
    async (details) => {
      if (
        details.type === "script" &&
        details.url.includes("https://www.googletagmanager.com/gtm.js")
      ) {
        const contentLengthObj = details.responseHeaders.find(
          (header) => header.name.toLowerCase() === "content-length"
        );
        const timing = requestTiming[details.requestId];

        if (timing) {
          timing.endTime = performance.now();
          timing.loadTime =
            Math.round(timing.endTime - timing.startTime) / 1000; //in seconds
        }

        if (contentLengthObj) {
          const contentLengthInKb = Math.round(
            parseInt(contentLengthObj.value) / 1024
          );

          const containerId = extractContainerId(details.url);

          if (!containersByTab[details.tabId]) {
            containersByTab[details.tabId] = {};
          }
          const gtmUrl = details.url;

          const analyse = await fetchGTMData(gtmUrl);

          containersByTab[details.tabId][containerId] = {
            sizeInKb: contentLengthInKb,
            percent: sizeByGoogleTagManagerLimit(
              parseInt(contentLengthObj.value)
            ),
            analyse,
            timing: timing ? timing : null,
          };
          const containerSize = sizeByGoogleTagManagerLimit(
            parseInt(contentLengthObj.value)
          );
          const numberOfContainers = Object.keys(
            containersByTab[details.tabId]
          ).length;

          setBadgeInfo(
            contentLengthInKb,
            containerSize,
            details.tabId,
            numberOfContainers
          );
          delete requestTiming[details.requestId];
        }
      }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );

  function setBadgeInfo(
    contentLengthInKb,
    containerSize,
    tabId,
    numberOfContainers
  ) {
    let badgeText = `${contentLengthInKb}KB`;
    let badgeColor = "green"; // Cor padrão

    if (numberOfContainers > 1) {
      badgeText = "!";
      badgeColor = "orange";
    } else {
      if (containerSize >= 50 && containerSize <= 69) {
        badgeColor = "yellow";
      } else if (containerSize >= 70) {
        badgeColor = "red";
      }
    }

    chrome.action.setBadgeText({
      text: badgeText,
      tabId: tabId,
    });

    chrome.action.setBadgeBackgroundColor({
      color: badgeColor,
      tabId: tabId,
    });
  }

  function extractContainerId(url) {
    const match = url.match(/id=[A-Za-z0-9_-]+/); // Altere isso conforme o formato real do ID do container
    return match ? match[0].split("=")[1] : "unknown";
  }

  function sizeByGoogleTagManagerLimit(sizeOfContainer = 0) {
    const googleTagManagerSizeLimit = 200 * 1024;
    return Math.round((sizeOfContainer / googleTagManagerSizeLimit) * 100);
  }

  function extractResourceDetails(jsonString) {
    const extractByRegex = (regex) => {
      let match = jsonString.match(regex);
      return match ? match[1] : null;
    };

    let versionRegex = /"version":"(.*?)"/;
    let macrosRegex = /"macros":(\[[\s\S]*?\](?=,\n))/;
    let predicatesRegex = /"predicates":(\[[\s\S]*?\](?=,\n))/;
    let tagsRegex = /"tags":(\[[\s\S]*?\](?=,\n))/;
    let rulesRegex = /"rules":(\[\[\[.*?\]\]\])/;

    let version = extractByRegex(versionRegex);
    let macros = extractByRegex(macrosRegex);
    let predicates = extractByRegex(predicatesRegex);
    let tags = extractByRegex(tagsRegex);
    let rules = extractByRegex(rulesRegex);

    try {
      macros = macros ? JSON.parse(macros).length : null;
      predicates = predicates ? JSON.parse(predicates).length : null;
      tags = tags ? JSON.parse(tags) : null;
      rules = rules ? JSON.parse(rules).length : null;
    } catch (e) {
      console.log("Erro ao parsear JSON:", e.message);
    }

    tags = {
      _html: tags.filter((tag) => tag.function === "__html").length,
      __gaawe: tags.filter((tag) => tag.function === "__gaawe").length,
      __googtag: tags.filter((tag) => tag.function === "__googtag").length,
      total: tags.length,
    };

    tags["__unknow"] =
      tags.total - (tags._html + tags.__gaawe + tags.__googtag);

    return { version, macros, predicates, tags, rules };
  }

  async function fetchGTMData(url) {
    try {
      const response = await fetch(url);
      const scriptString = await response.text();
      const data = extractResourceDetails(scriptString);
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do GTM:", error);
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.time) {
      pageLoadTiming = request.time;
    }

    if (request.tabId && containersByTab[request.tabId]) {
      sendResponse({
        containers: containersByTab[request.tabId],
        pageLoadTiming,
      });
    } else {
      sendResponse({ containers: {} });
    }
    return true;
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    if (containersByTab[tabId]) {
      delete containersByTab[tabId];
    }
  });

  let lastUrlByTab = {}; // Armazenar o último URL por aba

  // Listener para quando a aba é atualizada
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Verificar se o URL da aba mudou
    if (lastUrlByTab[tabId] && lastUrlByTab[tabId] !== tab.url) {
      // Limpar os dados do container se o URL mudou
      delete containersByTab[tabId];
    }

    // Atualizar o último URL conhecido para esta aba
    lastUrlByTab[tabId] = tab.url;
  });
})();
