(function () {
  'use strict';
  
  // Variáveis de estado
  const containersByTab = {};
  const requestTiming = {};
  let pageLoadTiming = null;
  const lastUrlByTab = {};

  function isGTMRequest(url) {
    const gtmPatterns = [
      // Official Google pattern
      /https:\/\/www\.googletagmanager\.com\/gtm\.js/,
      // Generic pattern to detect GTM in any domain
      /\/gtm\.js\?id=GTM-[A-Z0-9]+/,
      // Broader pattern to capture variations
      /gtm\.js\?id=GTM-[A-Z0-9-]+/
    ];
    return gtmPatterns.some(pattern => pattern.test(url));
  }

  function extractContainerId(url) {
    // Look for GTM-XXXXXX patterns in the URL
    const gtmIdMatch = url.match(/GTM-[A-Z0-9-_]+/);
    if (gtmIdMatch) {
      return gtmIdMatch[0];
    }
    
    // Fallback for other patterns
    const idMatch = url.match(/id=([A-Za-z0-9_-]+)/);
    return idMatch ? idMatch[1] : "unknown";
  }

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.type === "script" && isGTMRequest(details.url)) {
        console.log("GTM detectado:", details.url);
        requestTiming[details.requestId] = {
          startTime: performance.now(),
        };
      }
    },
    { urls: ["<all_urls>"] }
  );

  chrome.webRequest.onCompleted.addListener(
    async (details) => {
      if (details.type === "script" && isGTMRequest(details.url)) {
        console.log('[GTM Size] GTM script detected:', details.url);
        
        try {
          // Obter o tempo de carregamento
          const timing = requestTiming[details.requestId];
          if (timing) {
            timing.endTime = performance.now();
            timing.loadTime = Math.round(timing.endTime - timing.startTime) / 1000; //in seconds
          }
          
          // Inicializar variáveis de tamanho
          let contentLengthInKb = 0;
          let uncompressedSizeKb = 0;
          let sizeEstimate = false; // Flag para indicar se o tamanho é uma estimativa
          
          try {
            console.log('[GTM Size] Processing GTM container...');
            
            // 1. Obter o content-length do header da resposta
            const contentLengthHeader = details.responseHeaders?.find(
              (header) => header.name.toLowerCase() === "content-length"
            );
            
            if (contentLengthHeader?.value) {
              contentLengthInKb = Math.round(parseInt(contentLengthHeader.value) / 1024);
              console.log(`[GTM Size] Content-Length from response headers: ${contentLengthInKb}KB`);
              
              // Usar o content-length como tamanho transferido
              console.log(`[GTM Size] Using Content-Length as transferred size: ${contentLengthInKb}KB`);
              
              // Buscar o conteúdo apenas para obter o tamanho descomprimido
              const response = await fetch(details.url, {
                cache: 'no-store',
                credentials: 'same-origin'
              });
              
              // Obter o conteúdo para calcular tamanho descomprimido
              const text = await response.text();
              uncompressedSizeKb = Math.round(new TextEncoder().encode(text).length / 1024);
              
              // Verificar se há compressão
              const contentEncoding = response.headers.get('content-encoding');
              const isCompressed = !!contentEncoding;
              
              if (isCompressed) {
                console.log(`[GTM Size] Compression detected: ${contentEncoding}`);
                console.log(`[GTM Size] Transferred (compressed): ${contentLengthInKb}KB`);
                console.log(`[GTM Size] Uncompressed size: ${uncompressedSizeKb}KB`);
              } else {
                console.log(`[GTM Size] No compression detected`);
                console.log(`[GTM Size] Transferred: ${contentLengthInKb}KB`);
                // Se não estiver comprimido, ambos os tamanhos são iguais
                uncompressedSizeKb = contentLengthInKb;
              }
            } else {
              console.log('[GTM Size] No Content-Length header found, falling back to fetch...');
              
              // Marcar como estimativa, já que não temos o content-length
              sizeEstimate = true;
              console.log('[GTM Size] Setting sizeEstimate to true (no Content-Length header)');
              
              // Se não tiver content-length, fazer fetch para obter o tamanho
              const response = await fetch(details.url, {
                cache: 'no-store',
                credentials: 'same-origin'
              });
              
              const buffer = await response.arrayBuffer();
              contentLengthInKb = Math.round(buffer.byteLength / 1024);
              
              // Obter tamanho descomprimido
              const text = new TextDecoder().decode(buffer);
              uncompressedSizeKb = Math.round(new TextEncoder().encode(text).length / 1024);
              
              const contentEncoding = response.headers.get('content-encoding');
              const isCompressed = !!contentEncoding;
              
              console.log(`[GTM Size] Fetched size: ${contentLengthInKb}KB` + 
                         (isCompressed ? ` (compressed with ${contentEncoding})` : ''));
              console.log(`[GTM Size] Uncompressed size: ${uncompressedSizeKb}KB`);
              console.log(`[GTM Size] Using sizeEstimate: ${sizeEstimate}`);
            }
            
          } catch (error) {
            console.error('[GTM Size] Error measuring container size:', error);
            // Fallback para content-length se o fetch falhar
            if (contentLengthHeader?.value) {
              contentLengthInKb = Math.round(parseInt(contentLengthHeader.value) / 1024);
              console.log('[GTM Size] Using content-length as fallback:', contentLengthInKb, 'KB');
            }
          }

          const containerId = extractContainerId(details.url);
          const gtmUrl = details.url;

          if (!containersByTab[details.tabId]) {
            containersByTab[details.tabId] = {};
          }

          const analyse = await fetchGTMData(gtmUrl);
          const containerSize = sizeByGoogleTagManagerLimit(contentLengthInKb * 1024);

          console.log(`[GTM Size] Preparando container data - sizeEstimate: ${sizeEstimate}`);
          const containerData = {
            sizeInKb: contentLengthInKb,
            percent: containerSize,
            analyse,
            timing: timing || null,
            url: gtmUrl,
            isProxy: !gtmUrl.includes('googletagmanager.com'),
            sizeEstimate: sizeEstimate // Adiciona a flag de estimativa
          };
          console.log('[GTM Size] Container data:', JSON.stringify(containerData, null, 2));
          
          console.log('Container data prepared:', containerData);
          containersByTab[details.tabId][containerId] = containerData;
          console.log('Updated containersByTab:', containersByTab);

          const numberOfContainers = Object.keys(containersByTab[details.tabId]).length;

          setBadgeInfo(
            contentLengthInKb,
            containerSize,
            details.tabId,
            numberOfContainers
          );
          delete requestTiming[details.requestId];
        } catch (error) {
          console.error('Error processing GTM script:', error);
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

    // Inicializa o objeto tags com valores padrão
    const tagsInfo = {
      _html: 0,
      __gaawe: 0,
      __googtag: 0,
      total: 0,
      __unknow: 0
    };

    // Se tags for um array, processa as tags
    if (Array.isArray(tags)) {
      tagsInfo._html = tags.filter((tag) => tag.function === "__html").length;
      tagsInfo.__gaawe = tags.filter((tag) => tag.function === "__gaawe").length;
      tagsInfo.__googtag = tags.filter((tag) => tag.function === "__googtag").length;
      tagsInfo.total = tags.length;
      tagsInfo.__unknow = tagsInfo.total - (tagsInfo._html + tagsInfo.__gaawe + tagsInfo.__googtag);
    }
    
    return { version, macros, predicates, tags: tagsInfo, rules };
  }

  async function fetchGTMData(url) {
    try {
      console.log('Fetching GTM data from:', url);
      const response = await fetch(url, {
        cache: 'no-store', // Bypass cache to get fresh data
        credentials: 'same-origin' // Include cookies if needed for authentication
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const scriptString = await response.text();
      console.log('Fetched GTM script, length:', scriptString.length, 'bytes');
      const data = extractResourceDetails(scriptString);
      console.log('Extracted GTM data:', data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do GTM:", error);
      // Return default values in case of error
      return {
        version: "unknown",
        macros: 0,
        predicates: 0,
        tags: { 
          _html: 0, 
          __gaawe: 0, 
          __googtag: 0, 
          total: 0, 
          __unknow: 0 
        },
        rules: 0
      };
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    
    if (request.time) {
      pageLoadTiming = request.time;
      console.log('Page load timing updated:', pageLoadTiming);
    }

    // If no tabId is provided, try to get the active tab
    if (!request.tabId && sender.tab) {
      request.tabId = sender.tab.id;
    }

    console.log('Current containersByTab:', containersByTab);
    console.log('Looking for tab ID:', request.tabId);
    
    if (request.tabId !== undefined) {
      const containers = containersByTab[request.tabId] || {};
      console.log('Returning containers for tab', request.tabId, ':', containers);
      
      sendResponse({
        containers: containers,
        pageLoadTiming: pageLoadTiming || 0
      });
    } else {
      console.log('No tabId provided, returning empty containers');
      sendResponse({ containers: {} });
    }
    
    return true; // Keep the message channel open for async response
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    if (containersByTab[tabId]) {
      delete containersByTab[tabId];
    }
  });

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
