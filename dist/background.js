/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
(function () {
  'use strict';

  console.log('[GTM Size] Background script iniciado');

  // Variáveis de estado
  const containersByTab = {};
  const requestTiming = {};
  let pageLoadTiming = null;
  const lastUrlByTab = {};
  let activeTabId = null;

  // Função para salvar containers no cache
  async function saveContainersToCache(tabId, containers) {
    if (!tabId || !containers) return;
    try {
      const cacheKey = `containers_${tabId}`;
      await chrome.storage.local.set({
        [cacheKey]: {
          containers,
          timestamp: Date.now(),
          url: lastUrlByTab[tabId] || ''
        }
      });
      console.log(`[GTM Size] Containers salvos no cache para a tab ${tabId}`);
    } catch (error) {
      console.error('[GTM Size] Erro ao salvar containers no cache:', error);
    }
  }

  // Função para carregar containers do cache
  async function loadContainersFromCache(tabId) {
    if (!tabId) return null;
    try {
      const cacheKey = `containers_${tabId}`;
      const result = await chrome.storage.local.get(cacheKey);
      const cachedData = result[cacheKey];

      // Verifica se o cache é válido (menos de 5 minutos)
      if (cachedData && Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        console.log(`[GTM Size] Containers carregados do cache para a tab ${tabId}`);
        return cachedData.containers;
      }
      return null;
    } catch (error) {
      console.error('[GTM Size] Erro ao carregar containers do cache:', error);
      return null;
    }
  }

  // Função para verificar se uma URL é um proxy GTM
  function isGtmProxy(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('googletagmanager.com') && (url.includes('/gtm.js') || url.includes('/gtag/js') || url.includes('/gtm.'));
    } catch (e) {
      console.error('[GTM Size] URL inválida ao verificar proxy:', url, e);
      return false;
    }
  }

  // Função para verificar se uma URL é uma requisição do GTM
  function isGTMRequest(url) {
    if (!url || typeof url !== 'string') return false;
    const gtmPatterns = [
    // Official Google pattern
    /https:\/\/www\.googletagmanager\.com\/gtm\.js/,
    // Generic pattern to detect GTM in any domain
    /\/gtm\.js\?id=GTM-[A-Z0-9]+/,
    // Broader pattern to capture variations
    /gtm\.js\?id=GTM-[A-Z0-9-]+/];
    return gtmPatterns.some(pattern => pattern.test(url));
  }

  // Função para extrair o ID do container de uma URL do GTM
  function extractContainerId(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id');
    } catch (e) {
      console.error('[GTM Size] Erro ao extrair ID do container:', url, e);
      return null;
    }
  }

  // Listener para requisições de script GTM
  chrome.webRequest.onBeforeRequest.addListener(details => {
    console.log(`[GTM Size] Nova requisição detectada: ${details.url}`, {
      type: details.type,
      tabId: details.tabId,
      frameId: details.frameId,
      requestId: details.requestId
    });
    if (details.type === "script" && isGTMRequest(details.url)) {
      console.log("[GTM Size] GTM detectado:", details.url, "na aba", details.tabId);
      requestTiming[details.requestId] = {
        startTime: performance.now(),
        url: details.url,
        tabId: details.tabId
      };
      console.log(`[GTM Size] Tempo inicial registrado para request ${details.requestId}`);
    }
  }, {
    urls: ["<all_urls>"]
  });

  // Listener para requisições de script GTM concluídas
  chrome.webRequest.onCompleted.addListener(async details => {
    console.log(`[GTM Size] Requisição concluída: ${details.url}`, {
      type: details.type,
      tabId: details.tabId,
      requestId: details.requestId,
      statusCode: details.statusCode
    });
    if (details.type !== "script" || !isGTMRequest(details.url)) {
      console.log('[GTM Size] Ignorando requisição - não é um script GTM');
      return;
    }
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
      let sizeEstimate = false;
      try {
        console.log('[GTM Size] Processing GTM container...');

        // 1. Obter o content-length do header da resposta
        const contentLengthHeader = details.responseHeaders?.find(header => header.name.toLowerCase() === "content-length");
        if (contentLengthHeader?.value) {
          contentLengthInKb = Math.round(parseInt(contentLengthHeader.value) / 1024);
          console.log(`[GTM Size] Content-Length from response headers: ${contentLengthInKb}KB`);

          // Buscar o conteúdo para obter o tamanho descomprimido
          const response = await fetch(details.url, {
            cache: 'no-store',
            credentials: 'same-origin'
          });
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
            uncompressedSizeKb = contentLengthInKb;
          }
        } else {
          console.log('[GTM Size] No Content-Length header found, falling back to fetch...');
          sizeEstimate = true;
          const response = await fetch(details.url, {
            cache: 'no-store',
            credentials: 'same-origin'
          });
          const buffer = await response.arrayBuffer();
          contentLengthInKb = Math.round(buffer.byteLength / 1024);
          const text = new TextDecoder().decode(buffer);
          uncompressedSizeKb = Math.round(new TextEncoder().encode(text).length / 1024);
          const contentEncoding = response.headers.get('content-encoding');
          const isCompressed = !!contentEncoding;
          console.log(`[GTM Size] Fetched size: ${contentLengthInKb}KB` + (isCompressed ? ` (compressed with ${contentEncoding})` : ''));
          console.log(`[GTM Size] Uncompressed size: ${uncompressedSizeKb}KB`);
        }
      } catch (error) {
        console.error('[GTM Size] Error measuring container size:', error);
        if (contentLengthHeader?.value) {
          contentLengthInKb = Math.round(parseInt(contentLengthHeader.value) / 1024);
          console.log('[GTM Size] Using content-length as fallback:', contentLengthInKb, 'KB');
        }
      }
      const containerId = extractContainerId(details.url);
      const gtmUrl = details.url;
      try {
        // Ensure containersByTab exists and has the tab entry
        if (!containersByTab) {
          console.error('[GTM Size] containersByTab is not initialized');
          return;
        }

        // Initialize tab entry if it doesn't exist
        if (typeof containersByTab[details.tabId] === 'undefined') {
          containersByTab[details.tabId] = {};
        }

        // Ensure containerId is valid
        if (!containerId) {
          console.error('[GTM Size] Invalid container ID extracted from URL:', details.url);
          return;
        }
        const analyse = await fetchGTMData(gtmUrl);
        const containerSize = sizeByGoogleTagManagerLimit(contentLengthInKb * 1024);
        console.log(`[GTM Size] Preparing container data for ${containerId} - sizeEstimate: ${sizeEstimate}`);
        const containerData = {
          sizeInKb: contentLengthInKb,
          percent: containerSize,
          analyse,
          timing: timing || null,
          url: gtmUrl,
          isProxy: !gtmUrl.includes('googletagmanager.com'),
          sizeEstimate: sizeEstimate
        };

        // Safely set the container data
        containersByTab[details.tabId] = containersByTab[details.tabId] || {};
        containersByTab[details.tabId][containerId] = containerData;
        console.log(`[GTM Size] Container ${containerId} data stored for tab ${details.tabId}`);

        // Update the UI
        updateBadgeAndPopup(details.tabId, containerId, containerData);

        // Notify the sidepanel about the update
        chrome.runtime.sendMessage({
          action: 'updateContainers',
          tabId: details.tabId,
          containerId: containerId,
          containerData: containerData
        });

        // Update badge with container count
        const numberOfContainers = Object.keys(containersByTab[details.tabId]).length;
        setBadgeInfo(contentLengthInKb, containerSize, details.tabId, numberOfContainers);

        // Clean up the timing data
        delete requestTiming[details.requestId];
      } catch (error) {
        console.error('[GTM Size] Error processing container data:', error);
        return; // Exit if there was an error
      }
    } catch (error) {
      console.error('Error processing GTM script:', error);
    }
  }, {
    urls: ["<all_urls>"]
  }, ["responseHeaders"]);

  // Listener para navegação concluída
  chrome.webNavigation.onCompleted.addListener(details => {
    if (details.frameId === 0) {
      // Apenas no frame principal
      chrome.scripting.executeScript({
        target: {
          tabId: details.tabId
        },
        func: () => performance.timing.loadEventEnd - performance.timing.navigationStart
      }, results => {
        if (results && results[0]) {
          pageLoadTiming = results[0].result / 1000; // Convert to seconds
          console.log('Page Load Time:', pageLoadTiming, 'seconds');
        }
      });
    }
  });
  function updateBadgeAndPopup(tabId, containerId, containerData) {
    console.log(`[GTM Size] Atualizando badge e popup para tab ${tabId}, container ${containerId}`, containerData);
    if (!containerData) {
      console.log('[GTM Size] Dados do container vazios, ignorando atualização');
      return;
    }

    // Atualiza o badge
    const percent = containerData.percent || 0;
    let text = percent > 0 ? `${percent}%` : '';
    let color = '#4CAF50'; // Verde

    if (percent > 80) {
      color = '#F44336'; // Vermelho
    } else if (percent > 50) {
      color = '#FFC107'; // Amarelo
    }

    chrome.action.setBadgeText({
      text,
      tabId
    });
    chrome.action.setBadgeBackgroundColor({
      color,
      tabId
    });

    // Se for a aba ativa, envia a atualização para o sidepanel
    if (activeTabId === tabId) {
      sendContainersToSidePanel(tabId);
    }
  }

  // Envia os containers da aba especificada para o sidepanel
  async function sendContainersToSidePanel(tabId) {
    console.log(`[GTM Size] Enviando containers para o sidepanel da tab ${tabId}`);
    try {
      if (!tabId) {
        console.error('[GTM Size] ID da tab não fornecido');
        return;
      }

      // Se não houver containers para esta aba, tenta obter do cache
      if (!containersByTab[tabId] || Object.keys(containersByTab[tabId]).length === 0) {
        console.log(`[GTM Size] Nenhum container encontrado na memória para a tab ${tabId}, verificando cache...`);
        const cachedContainers = await loadContainersFromCache(tabId);
        if (cachedContainers) {
          console.log(`[GTM Size] Usando containers do cache para a tab ${tabId}`);
          containersByTab[tabId] = cachedContainers;
        } else {
          console.log(`[GTM Size] Nenhum cache encontrado para a tab ${tabId}`);
        }
      }
      const containers = containersByTab[tabId] || {};
      const pageLoadTime = await getPageLoadTime(tabId);
      console.log(`[GTM Size] Enviando ${Object.keys(containers).length} containers para o sidepanel`);

      // Envia os containers para o sidepanel
      await sendToSidepanel({
        action: 'updateContainers',
        containers,
        pageLoadTiming: pageLoadTime,
        timestamp: Date.now(),
        tabId: tabId,
        fromCache: !(containersByTab[tabId] && Object.keys(containersByTab[tabId]).length > 0)
      });

      // Atualiza o cache
      if (Object.keys(containers).length > 0) {
        await saveContainersToCache(tabId, containers);
      }
    } catch (error) {
      console.error('[GTM Size] Erro ao enviar containers para o sidepanel:', error);
    }
  }
  async function sendToSidepanel(message) {
    let attempt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    const maxAttempts = 3;
    const retryDelay = 500;
    const targetTabId = message.tabId || activeTabId;
    if (targetTabId === null || targetTabId === undefined) {
      console.log('[GTM Size] Nenhuma aba válida para enviar mensagem para o sidepanel');
      return Promise.resolve();
    }

    // Se não for uma mensagem de atualização de containers, ignora silenciosamente
    if (message.action !== 'updateContainers' && message.action !== 'getContainers') {
      return Promise.resolve();
    }
    console.log(`[GTM Size] [Tentativa ${attempt}/${maxAttempts}] Enviando mensagem para o sidepanel, tabId: ${targetTabId}`, message.action);
    try {
      // Verifica se o sidepanel está aberto antes de tentar enviar a mensagem
      const isSidePanelOpen = await chrome.sidePanel.getOptions({
        tabId: targetTabId
      }).then(options => options.enabled).catch(() => false);
      if (!isSidePanelOpen) {
        console.log('[GTM Size] Sidepanel não está aberto, ignorando mensagem');
        return Promise.resolve();
      }

      // Envia a mensagem para a aba específica onde o sidepanel está aberto
      const response = await chrome.tabs.sendMessage(targetTabId, message);
      console.log(`[GTM Size] Resposta do sidepanel para ${message.action}:`, response);
      return response;
    } catch (error) {
      // Ignora erros específicos de conexão
      const isConnectionError = error.message.includes('Could not establish connection') || error.message.includes('Receiving end does not exist') || error.message.includes('Could not connect to port');
      if (isConnectionError) {
        // Se for a última tentativa, apenas loga e resolve sem erro
        if (attempt >= maxAttempts) {
          console.log(`[GTM Size] Sidepanel não respondeu após ${maxAttempts} tentativas`);
          return Promise.resolve();
        }

        // Se ainda houver tentativas, tenta novamente
        console.log(`[GTM Size] Tentativa ${attempt} falhou, tentando novamente em ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return sendToSidepanel(message, attempt + 1);
      }

      // Para outros erros, apenas loga e resolve sem erro
      console.error('[GTM Size] Erro ao enviar mensagem para o sidepanel:', error);
      return Promise.resolve();
    }
  }
  function getPageLoadTime(tabId) {
    chrome.scripting.executeScript({
      target: {
        tabId: tabId
      },
      func: () => performance.timing.loadEventEnd - performance.timing.navigationStart
    }, results => {
      if (results && results[0]) {
        pageLoadTiming = results[0].result / 1000; // Convert to seconds
        console.log('Page Load Time:', pageLoadTiming, 'seconds');
      }
    });
  }
  function setBadgeInfo(contentLengthInKb, containerSize, tabId, numberOfContainers) {
    if (contentLengthInKb === undefined || containerSize === undefined || tabId === undefined) {
      console.error('Missing required parameters for setBadgeInfo:', {
        contentLengthInKb,
        containerSize,
        tabId
      });
      return;
    }
    console.log('Setting badge info for tab', tabId, 'with size', contentLengthInKb, 'KB and percentage', containerSize);
    const text = numberOfContainers > 1 ? `${numberOfContainers} (${containerSize}%)` : `${containerSize}%`;
    chrome.action.setBadgeText({
      text,
      tabId: tabId
    });

    // Definir cor do badge baseado no tamanho do container
    const color = containerSize > 80 ? '#f44336' : containerSize > 60 ? '#ff9800' : '#4CAF50';
    chrome.action.setBadgeBackgroundColor({
      color,
      tabId: tabId
    });
  }
  function sizeByGoogleTagManagerLimit() {
    let sizeOfContainer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    const MAX_SIZE = 200 * 1024; // 200KB em bytes
    return Math.round(sizeOfContainer / MAX_SIZE * 100);
  }

  // Mapeamento de tipos de macros (variáveis)
  const MACRO_TYPES = {
    'k': 'Primary Cookie',
    'v': 'Auto Event Variable',
    'c': 'Constant',
    'ctv': 'Container Version Number',
    'e': 'Custom Event',
    'jsm': 'JavaScript Variable',
    'v': 'Data Layer Variable',
    'dbg': 'Debug Mode',
    'd': 'DOM Element',
    'vis': 'Element Visibility',
    'gas': 'Google Analytics Settings (legacy)',
    'f': 'HTTP Referrer',
    'j': 'JavaScript Variable',
    'smm': 'Lookup Table',
    'r': 'Random Number',
    'remm': 'RegEx Table',
    'u': 'URL',
    'gtes': 'Google Tag: Event Settings',
    'gas': 'Google Analytics: Settings',
    'gclid': 'Google Click ID',
    'aw.remarketing': 'Google Ads Remarketing',
    'flc': 'First-Party Cookie',
    'ct': 'Custom Template',
    'ct_js': 'Custom JavaScript',
    'ct_http': 'Custom HTTP Request',
    'ct_html': 'Custom HTML',
    'ct_img': 'Custom Image',
    'ct_ga': 'Google Analytics: Universal Analytics',
    'ct_ga4': 'Google Analytics 4',
    'ct_gtag': 'Google Tag',
    'ct_gtm.click': 'Click Variables',
    'ct_gtm.clickClasses': 'Click Classes',
    'ct_gtm.clickId': 'Click ID',
    'ct_gtm.clickTarget': 'Click Target',
    'ct_gtm.clickText': 'Click Text',
    'ct_gtm.clickURL': 'Click URL',
    'ct_gtm.element': 'Element',
    'ct_gtm.elementClasses': 'Element Classes',
    'ct_gtm.elementId': 'Element ID',
    'ct_gtm.elementTarget': 'Element Target',
    'ct_gtm.elementText': 'Element Text',
    'ct_gtm.elementURL': 'Element URL',
    'ct_gtm.formClasses': 'Form Classes',
    'ct_gtm.formElement': 'Form Element',
    'ct_gtm.formId': 'Form ID',
    'ct_gtm.formTarget': 'Form Target',
    'ct_gtm.formText': 'Form Text',
    'ct_gtm.formURL': 'Form URL',
    'ct_gtm.historyChangeSource': 'History Change Source',
    'ct_gtm.historyNewUrlFragment': 'New URL Fragment',
    'ct_gtm.historyNewUrlPath': 'New URL Path',
    'ct_gtm.historyNewUrlQueryParameters': 'New URL Query Parameters',
    'ct_gtm.historyNewUrlScheme': 'New URL Scheme',
    'ct_gtm.historyOldUrlFragment': 'Old URL Fragment',
    'ct_gtm.historyOldUrlPath': 'Old URL Path',
    'ct_gtm.historyOldUrlQueryParameters': 'Old URL Query Parameters',
    'ct_gtm.historyOldUrlScheme': 'Old URL Scheme',
    'ct_gtm.htmlId': 'HTML ID',
    'ct_gtm.jsError': 'JavaScript Error',
    'ct_gtm.jsErrorMessage': 'Error Message',
    'ct_gtm.jsErrorUrl': 'Error URL',
    'ct_gtm.jsErrorLine': 'Error Line',
    'ct_gtm.jsErrorCol': 'Error Column',
    'ct_gtm.jsErrorObject': 'Error Object',
    'ct_gtm.jsErrorStackTrace': 'Error Stack Trace',
    'ct_gtm.linkClasses': 'Link Classes',
    'ct_gtm.linkId': 'Link ID',
    'ct_gtm.linkTarget': 'Link Target',
    'ct_gtm.linkText': 'Link Text',
    'ct_gtm.linkUrl': 'Link URL',
    'ct_gtm.scrollDepthThreshold': 'Scroll Depth Threshold',
    'ct_gtm.scrollDepthUnits': 'Scroll Depth Units',
    'ct_gtm.scrollDirection': 'Scroll Direction',
    'ct_gtm.timerId': 'Timer ID',
    'ct_gtm.timerInterval': 'Timer Interval',
    'ct_gtm.timerLimit': 'Timer Limit',
    'ct_gtm.videoCurrentTime': 'Video Current Time',
    'ct_gtm.videoDuration': 'Video Duration',
    'ct_gtm.videoPercent': 'Video Percent',
    'ct_gtm.videoProvider': 'Video Provider',
    'ct_gtm.videoStatus': 'Video Status',
    'ct_gtm.videoTitle': 'Video Title',
    'ct_gtm.videoUrl': 'Video URL',
    'ct_gtm.videoVisible': 'Video Visible',
    'ct_gtm.visibleId': 'Visible ID',
    'ct_gtm.visiblePercentage': 'Visible Percentage',
    'ct_gtm.visibleTime': 'Visible Time',
    'ct_gtm.visibleThreshold': 'Visible Threshold',
    'ct_gtm.visibleUnits': 'Visible Units',
    'ct_gtm.window': 'Window',
    'ct_gtm.document': 'Document',
    'ct_gtm.navigator': 'Navigator',
    'ct_gtm.screen': 'Screen',
    'ct_gtm.history': 'History',
    'ct_gtm.location': 'Location',
    'ct_gtm.url': 'URL',
    'ct_gtm.referrer': 'Referrer',
    'ct_gtm.title': 'Title',
    'ct_gtm.timestamp': 'Timestamp',
    'ct_gtm.event': 'Event',
    'ct_gtm.gtm': 'Google Tag Manager',
    'ct_gtm.gtm.start': 'GTM Start',
    'ct_gtm.gtm.js': 'GTM JavaScript',
    'ct_gtm.gtm.dom': 'GTM DOM Ready',
    'ct_gtm.gtm.load': 'GTM Window Loaded',
    'ct_gtm.gtm.timer': 'GTM Timer',
    'ct_gtm.gtm.mouse': 'GTM Mouse',
    'ct_gtm.gtm.form': 'GTM Form',
    'ct_gtm.gtm.click': 'GTM Click',
    'ct_gtm.gtm.submit': 'GTM Form Submit',
    'ct_gtm.gtm.history': 'GTM History',
    'ct_gtm.gtm.jsError': 'GTM JavaScript Error',
    'ct_gtm.gtm.scroll': 'GTM Scroll',
    'ct_gtm.gtm.timer': 'GTM Timer',
    'ct_gtm.gtm.visible': 'GTM Element Visibility',
    'ct_gtm.gtm.youtube': 'GTM YouTube',
    'ct_gtm.gtm.vimeo': 'GTM Vimeo',
    'ct_gtm.gtm.soundcloud': 'GTM SoundCloud',
    'ct_gtm.gtm.video': 'GTM Video',
    'ct_gtm.gtm.audio': 'GTM Audio',
    'ct_gtm.gtm.form': 'GTM Form',
    'ct_gtm.gtm.linkClick': 'GTM Link Click',
    'ct_gtm.gtm.formSubmit': 'GTM Form Submit',
    'ct_gtm.gtm.historyChange': 'GTM History Change',
    'ct_gtm.gtm.jsError': 'GTM JavaScript Error',
    'ct_gtm.gtm.scrollDepth': 'GTM Scroll Depth',
    'ct_gtm.gtm.timer': 'GTM Timer',
    'ct_gtm.gtm.visibility': 'GTM Element Visibility',
    'ct_gtm.gtm.youtube': 'GTM YouTube',
    'ct_gtm.gtm.vimeo': 'GTM Vimeo',
    'ct_gtm.gtm.soundcloud': 'GTM SoundCloud',
    'ct_gtm.gtm.video': 'GTM Video',
    'ct_gtm.gtm.audio': 'GTM Audio',
    'ct_gtm.gtm.form': 'GTM Form',
    'ct_gtm.gtm.linkClick': 'GTM Link Click',
    'ct_gtm.gtm.formSubmit': 'GTM Form Submit',
    'ct_gtm.gtm.historyChange': 'GTM History Change',
    'ct_gtm.gtm.jsError': 'GTM JavaScript Error',
    'ct_gtm.gtm.scrollDepth': 'GTM Scroll Depth',
    'ct_gtm.gtm.timer': 'GTM Timer',
    'ct_gtm.gtm.visibility': 'GTM Element Visibility',
    'ct_gtm.gtm.youtube': 'GTM YouTube',
    'ct_gtm.gtm.vimeo': 'GTM Vimeo',
    'ct_gtm.gtm.soundcloud': 'GTM SoundCloud',
    'ct_gtm.gtm.video': 'GTM Video',
    'ct_gtm.gtm.audio': 'GTM Audio'
  };

  // Mapeamento de tipos de acionadores (triggers)
  const TRIGGER_TYPES = {
    'evl': 'Element Visibility',
    'cl': 'Click Listener',
    'fsl': 'Form Submit Listener',
    'hl': 'History Listener',
    'jel': 'JavaScript Error Listener',
    'lcl': 'Link Click Listener',
    'sdl': 'Scroll Depth Listener',
    'tl': 'Timer Listener',
    'ytl': 'YouTube Video Listener'
  };

  // Mapeamento de tags conhecidas e suas categorias
  const KNOWN_TAGS = {
    // Google Tags
    'googtag': {
      name: 'Google Tag',
      category: 'google'
    },
    'ga': {
      name: 'Google Analytics (Legacy)',
      category: 'google'
    },
    'ua': {
      name: 'Universal Analytics',
      category: 'google'
    },
    'gaawe': {
      name: 'Google Analytics 4',
      category: 'google'
    },
    'awct': {
      name: 'Google Ads Conversion',
      category: 'google'
    },
    'sp': {
      name: 'Google Ads Remarketing',
      category: 'google'
    },
    'flc': {
      name: 'Floodlight Counter',
      category: 'google'
    },
    'fls': {
      name: 'Floodlight Sales',
      category: 'google'
    },
    'ts': {
      name: 'Google Trusted Stores',
      category: 'google'
    },
    'gcs': {
      name: 'Google Consumer Surveys',
      category: 'google'
    },
    'gclidw': {
      name: 'Google Ads Conversion Linker',
      category: 'google'
    },
    'gaawc': {
      name: 'Google Tag (GA4)',
      category: 'google'
    },
    // Common non-Google Scripts
    'html': {
      name: 'Custom HTML',
      category: 'custom'
    },
    'img': {
      name: 'Custom Image',
      category: 'custom'
    },
    'cegg': {
      name: 'Crazy Egg',
      category: 'analytics'
    },
    'mf': {
      name: 'Mouseflow',
      category: 'analytics'
    },
    'pntr': {
      name: 'Pinterest',
      category: 'social'
    },
    'twitter_website_tag': {
      name: 'Twitter Website Tag',
      category: 'social'
    },
    'bzi': {
      name: 'LinkedIn Insight',
      category: 'social'
    },
    'fbq': {
      name: 'Facebook Pixel',
      category: 'advertising'
    },
    'crto': {
      name: 'Criteo',
      category: 'advertising'
    },
    'pa': {
      name: 'Perfect Audience',
      category: 'advertising'
    },
    'qcm': {
      name: 'Quantcast',
      category: 'advertising'
    },
    'qpx': {
      name: 'Quora Pixel',
      category: 'advertising'
    },
    'scjs': {
      name: 'SaleCycle JS',
      category: 'marketing'
    },
    'scp': {
      name: 'SaleCycle Pixel',
      category: 'marketing'
    },
    'okt': {
      name: 'Oktopost',
      category: 'social'
    },
    'zone': {
      name: 'Zonas',
      category: 'other'
    },
    'yieldify': {
      name: 'Yieldify',
      category: 'marketing'
    },
    'xpsh': {
      name: 'Xtremepush',
      category: 'marketing'
    },
    'vei': {
      name: 'Ve Interactive',
      category: 'marketing'
    },
    'veip': {
      name: 'Ve Pixel',
      category: 'marketing'
    },
    'vdc': {
      name: 'VisualDNA',
      category: 'analytics'
    },
    'uslt': {
      name: 'Upsellit Footer',
      category: 'marketing'
    },
    'uspt': {
      name: 'Upsellit Confirmation',
      category: 'marketing'
    },
    'tdc': {
      name: 'Turn Data Collection',
      category: 'analytics'
    },
    'tc': {
      name: 'Turn Conversion',
      category: 'analytics'
    },
    'tdsc': {
      name: 'Tradedoubler Sale',
      category: 'affiliate'
    },
    'tdlc': {
      name: 'Tradedoubler Lead',
      category: 'affiliate'
    },
    'svw': {
      name: 'Survicate',
      category: 'feedback'
    },
    'shareaholic': {
      name: 'Shareaholic',
      category: 'social'
    },
    'sfr': {
      name: 'SearchForce Redirect',
      category: 'advertising'
    },
    'sfl': {
      name: 'SearchForce Landing',
      category: 'advertising'
    },
    'sfc': {
      name: 'SearchForce Conversion',
      category: 'advertising'
    },
    'sca': {
      name: 'Intent Media',
      category: 'advertising'
    },
    'placedPixel': {
      name: 'Placed',
      category: 'analytics'
    },
    'pc': {
      name: 'Personali Canvas',
      category: 'personalization'
    },
    'okt': {
      name: 'Oktopost',
      category: 'social'
    },
    'nudge': {
      name: 'Nudge',
      category: 'feedback'
    },
    'ndcr': {
      name: 'Nielsen DCR',
      category: 'analytics'
    },
    'messagemate': {
      name: 'Message Mate',
      category: 'chat'
    },
    'mpr': {
      name: 'Mediaplex ROI',
      category: 'advertising'
    },
    'mpm': {
      name: 'Mediaplex MCT',
      category: 'advertising'
    },
    'ms': {
      name: 'Marin Software',
      category: 'advertising'
    },
    'ljs': {
      name: 'Lytics JS',
      category: 'analytics'
    },
    'll': {
      name: 'LeadLab',
      category: 'marketing'
    },
    'k50Init': {
      name: 'K50',
      category: 'analytics'
    },
    'infinity': {
      name: 'Infinity Call',
      category: 'analytics'
    },
    'hjtc': {
      name: 'Hotjar',
      category: 'analytics'
    },
    'fxm': {
      name: 'FoxMetrics',
      category: 'analytics'
    },
    'dstag': {
      name: 'DistroScale',
      category: 'content'
    },
    'cts': {
      name: 'ClickTale',
      category: 'analytics'
    },
    'csm': {
      name: 'comScore',
      category: 'analytics'
    },
    'bb': {
      name: 'Bizrate Buyer',
      category: 'feedback'
    },
    'bsa': {
      name: 'Bizrate Survey',
      category: 'feedback'
    },
    'baut': {
      name: 'Bing Universal',
      category: 'advertising'
    },
    'awj': {
      name: 'Affiliate Window',
      category: 'affiliate'
    },
    'awc': {
      name: 'Affiliate Window Conv',
      category: 'affiliate'
    },
    'asp': {
      name: 'AdRoll Smart Pixel',
      category: 'advertising'
    },
    'adm': {
      name: 'Adometry',
      category: 'analytics'
    },
    'ta': {
      name: 'AdAdvisor/Neustar',
      category: 'advertising'
    },
    'abtGeneric': {
      name: 'AB Tasty',
      category: 'testing'
    }
  };

  // Categorias amigáveis
  const CATEGORY_NAMES = {
    'google': 'Google',
    'custom': 'Custom',
    'analytics': 'Analytics',
    'advertising': 'Advertising',
    'marketing': 'Marketing',
    'social': 'Social Media',
    'affiliate': 'Affiliate',
    'feedback': 'Feedback',
    'testing': 'A/B Testing',
    'chat': 'Chat',
    'content': 'Content',
    'personalization': 'Personalization',
    'other': 'Other'
  };

  // Função para obter o nome amigável de uma tag
  function getFriendlyTagName(tagId) {
    // Verifica se é um template customizado
    if (tagId.startsWith('cvt_')) {
      return {
        name: 'Custom Template',
        category: 'custom'
      };
    }

    // Verifica se a tag é conhecida
    const knownTag = KNOWN_TAGS[tagId];
    if (knownTag) {
      return {
        name: knownTag.name,
        category: CATEGORY_NAMES[knownTag.category] || 'Other'
      };
    }

    // Para tags desconhecidas, retorna o ID original
    return {
      name: tagId.startsWith('_') ? tagId.substring(1) : tagId,
      category: 'Other'
    };
  }
  function extractResourceDetails(resourceObj) {
    // 5. Extrai e processa os campos
    const version = resourceObj.version || null;
    const macros = Array.isArray(resourceObj.macros) ? resourceObj.macros : [];
    const predicates = Array.isArray(resourceObj.predicates) ? resourceObj.predicates : [];
    const tagsArr = Array.isArray(resourceObj.tags) ? resourceObj.tags : [];
    const rules = Array.isArray(resourceObj.rules) ? resourceObj.rules : [];

    // Filtra apenas as tags que são realmente tags e não variáveis ou acionadores
    const validTags = tagsArr.filter(tag => {
      if (!tag || !tag.function) return false;

      // Ignora variáveis e acionadores comuns
      const ignoreList = ['cl', 'evl', 'fsl', 'lcl', 'sdl', 'dl', 'ev', 'f', 'v'];
      const tagId = tag.function.startsWith('__') ? tag.function.substring(2) : tag.function;

      // Se for uma tag personalizada (começa com 'cvt_') ou não está na lista de ignorados
      return tag.function.startsWith('cvt_') || !ignoreList.includes(tagId);
    });

    // Processa as tags para usar o nome do Container Nalytis quando disponível
    const tagData = {};
    validTags.forEach(tag => {
      const tagId = tag.function.startsWith('__') ? tag.function.substring(2) : tag.function;
      const tagInfo = getFriendlyTagName(tagId);

      // Usa o nome do Container Nalytis se disponível, senão usa o nome amigável
      const displayName = tag.tagName || tag.name || tagInfo.name;

      // Incrementa a contagem para este tipo de tag
      if (!tagData[displayName]) {
        tagData[displayName] = 0;
      }
      tagData[displayName]++;
    });

    // Processa as macros (variáveis)
    const macroData = {};
    if (Array.isArray(resourceObj.macros)) {
      resourceObj.macros.forEach(macro => {
        if (!macro || !macro.function) return;

        // Remove os underlines do início do nome da função, se houver
        const macroFunction = macro.function.startsWith('__') ? macro.function.substring(2) : macro.function;

        // Verifica se a macro está no mapeamento
        if (MACRO_TYPES[macroFunction] || macro.name) {
          // Usa o nome personalizado da macro se disponível, senão usa o nome do mapeamento
          const macroName = macro.name || MACRO_TYPES[macroFunction];
          if (macroName) {
            if (!macroData[macroName]) {
              macroData[macroName] = 0;
            }
            macroData[macroName]++;
          }
        }
      });
    }

    // Processa os acionadores (triggers) diretamente das tags
    const triggerData = {};
    const triggerIds = ['evl', 'cl', 'fsl', 'hl', 'jel', 'lcl', 'sdl', 'tl', 'ytl'];
    if (Array.isArray(resourceObj.tags)) {
      resourceObj.tags.forEach(tag => {
        if (!tag || !tag.function) return;

        // Pega o ID da tag (remove o __ se existir)
        const tagId = tag.function.startsWith('__') ? tag.function.substring(2) : tag.function;

        // Verifica se é um acionador conhecido
        if (triggerIds.includes(tagId)) {
          const triggerName = TRIGGER_TYPES[tagId] || tagId;
          if (!triggerData[triggerName]) {
            triggerData[triggerName] = 0;
          }
          triggerData[triggerName]++;
        }
      });
    }

    // Ordena as tags, acionadores e macros
    const sortedTags = Object.entries(tagData).sort((_ref, _ref2) => {
      let [nameA] = _ref;
      let [nameB] = _ref2;
      return nameA.localeCompare(nameB);
    });
    const sortedTriggers = Object.entries(triggerData).sort((_ref3, _ref4) => {
      let [nameA] = _ref3;
      let [nameB] = _ref4;
      return nameA.localeCompare(nameB);
    });
    const sortedMacros = Object.entries(macroData).sort((_ref5, _ref6) => {
      let [nameA] = _ref5;
      let [nameB] = _ref6;
      return nameA.localeCompare(nameB);
    });
    return {
      version,
      macros: {
        byName: Object.fromEntries(sortedMacros),
        total: Object.values(macroData).reduce((sum, count) => sum + count, 0)
      },
      predicates,
      tags: {
        byName: Object.fromEntries(sortedTags),
        total: validTags.length
      },
      triggers: {
        byName: Object.fromEntries(sortedTriggers),
        total: Object.values(triggerData).reduce((sum, count) => sum + count, 0)
      },
      rules
    };
  }
  async function fetchGTMData(url) {
    // Validação da URL de entrada
    if (!url || typeof url !== 'string') {
      console.error('[GTM Size] URL inválida para buscar dados do GTM:', url);
      return {
        version: null,
        macros: null,
        predicates: null,
        tags: null,
        rules: null
      };
    }

    // Valida se a URL parece ser um script GTM
    if (!isGTMRequest(url) && !isGtmProxy(url)) {
      console.error('[GTM Size] URL não parece ser um script GTM válido:', url);
      return {
        version: null,
        macros: null,
        predicates: null,
        tags: null,
        rules: null
      };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout de 15 segundos

    try {
      console.log('[GTM Size] Buscando dados do GTM de:', url);
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const scriptString = await response.text();
      if (!scriptString || typeof scriptString !== 'string') {
        throw new Error('Resposta vazia ou inválida do servidor');
      }

      // Encontra o início do objeto data
      const dataStart = scriptString.indexOf('var data = ');
      if (dataStart === -1) {
        console.error('[GTM Size] Objeto data não encontrado no script');
        return {
          version: null,
          macros: null,
          predicates: null,
          tags: null,
          rules: null
        };
      }

      // Encontra o início do JSON (após 'var data = ')
      const jsonStart = scriptString.indexOf('{', dataStart);
      if (jsonStart === -1) {
        console.error('[GTM Size] Início do JSON não encontrado');
        return {
          version: null,
          macros: null,
          predicates: null,
          tags: null,
          rules: null
        };
      }

      // Encontra o final do objeto
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;
      let jsonEnd = -1;
      for (let i = jsonStart; i < scriptString.length; i++) {
        const char = scriptString[i];
        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        // Trata caracteres de escape
        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        // Trata aspas dentro de strings
        if (char === '"') {
          inString = !inString;
          continue;
        }

        // Conta as chaves apenas fora de strings
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
      }
      if (jsonEnd === -1) {
        console.error('[GTM Size] Não foi possível encontrar o final do objeto data');
        return {
          version: null,
          macros: null,
          predicates: null,
          tags: null,
          rules: null
        };
      }

      // Extrai a string JSON
      const jsonStr = scriptString.substring(jsonStart, jsonEnd);
      try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object') {
          throw new Error('Dados inválidos retornados pelo GTM');
        }
        const result = extractResourceDetails(data.resource || data);
        if (!result) {
          throw new Error('Falha ao processar os dados do GTM');
        }
        return result;
      } catch (parseError) {
        console.error('[GTM Size] Erro ao fazer parse do JSON:', parseError);
        return {
          version: null,
          macros: null,
          predicates: null,
          tags: null,
          rules: null
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('[GTM Size] Timeout ao buscar dados do GTM');
      } else if (error instanceof TypeError) {
        console.error('[GTM Size] Erro de rede ou URL inválida:', error.message);
      } else {
        console.error('[GTM Size] Erro ao buscar dados do GTM:', error);
      }
      return {
        version: null,
        macros: null,
        predicates: null,
        tags: null,
        rules: null
      };
    }
  }

  // Configura o painel lateral
  async function setupSidePanel() {
    try {
      await chrome.sidePanel.setOptions({
        path: 'sidepanel.html',
        enabled: true
      });
      console.log('Side panel configured successfully');
    } catch (error) {
      console.error('Error setting up side panel:', error);
    }
  }

  // Configura o painel lateral quando a extensão é instalada ou atualizada
  chrome.runtime.onInstalled.addListener(() => {
    setupSidePanel();
  });

  // Abrir o painel lateral quando o ícone da extensão for clicado
  chrome.action.onClicked.addListener(tab => {
    chrome.sidePanel.open({
      windowId: tab.windowId
    });
  });
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    if (request.action === 'getContainers') {
      const tabId = request.tabId;
      console.log('Getting containers for tab:', tabId);
      console.log('Current containersByTab:', containersByTab);
      if (containersByTab[tabId]) {
        console.log('Returning containers for tab', tabId, ':', containersByTab[tabId]);
        // Enviar os containers para o painel lateral
        chrome.runtime.sendMessage({
          type: 'CONTAINERS_UPDATED',
          tabId: tabId,
          containers: containersByTab[tabId] || {}
        });
        console.log('Sending container data to sidepanel:', JSON.stringify({
          containers: containersByTab[request.tabId],
          pageLoadTiming
        }, null, 2));
        sendResponse({
          containers: containersByTab[tabId] || {}
        });
      } else {
        console.log('No containers found for tab', tabId);
        sendResponse({
          containers: {}
        });
      }
      return true; // Indica que a resposta será assíncrona
    }

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
      sendResponse({
        containers: {}
      });
    }
    return true; // Keep the message channel open for async response
  });

  // Listener para quando uma aba é removida
  chrome.tabs.onRemoved.addListener(tabId => {
    if (containersByTab[tabId]) {
      delete containersByTab[tabId];
    }
    if (lastUrlByTab[tabId]) {
      delete lastUrlByTab[tabId];
    }
    // Se a aba removida era a ativa, limpa o sidepanel
    if (activeTabId === tabId) {
      activeTabId = null;
      sendContainersToSidePanel(null);
    }
  });

  // Listener para quando a aba é atualizada
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Verificar se o URL da aba mudou
    if (changeInfo.status === 'complete' && tab.url) {
      const urlChanged = lastUrlByTab[tabId] !== tab.url;
      if (urlChanged) {
        // Limpar os dados do container se o URL mudou
        delete containersByTab[tabId];
        // Atualizar o último URL conhecido para esta aba
        lastUrlByTab[tabId] = tab.url;
        // Se for a aba ativa, atualiza o sidepanel
        if (activeTabId === tabId) {
          sendContainersToSidePanel(tabId);
        }
      }
    }
  });

  // Abrir o sidepanel quando o ícone da extensão for clicado
  chrome.action.onClicked.addListener(async tab => {
    console.log(`[GTM Size] Ícone clicado na aba ${tab.id} (${tab.url})`);
    try {
      // Atualiza a aba ativa quando o ícone é clicado
      activeTabId = tab.id;
      console.log(`[GTM Size] Aba ativa definida como: ${activeTabId}`);

      // Primeiro abre o sidepanel
      console.log(`[GTM Size] Abrindo sidepanel...`);
      await chrome.sidePanel.open({
        windowId: tab.windowId
      });

      // Pequeno delay para garantir que o sidepanel foi carregado
      await new Promise(resolve => setTimeout(resolve, 200));

      // Depois de abrir o sidepanel, envia os dados
      console.log(`[GTM Size] Enviando containers para o sidepanel...`);
      sendContainersToSidePanel(tab.id);
      console.log(`[GTM Size] Sidepanel aberto com sucesso`);
    } catch (error) {
      console.error('[GTM Size] Erro ao abrir o sidepanel:', error);
    }
  });

  // Adiciona um listener para mensagens do sidepanel
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[GTM Size] Mensagem recebida no background:', request);
    if (request.action === 'getContainers') {
      console.log(`[GTM Size] Solicitando containers para a tab ${request.tabId}`);
      const tabId = request.tabId || activeTabId;
      const containers = tabId && containersByTab[tabId] ? containersByTab[tabId] : {};
      console.log(`[GTM Size] Retornando ${Object.keys(containers).length} containers`);
      sendResponse({
        containers,
        activeTabId: tabId,
        pageLoadTiming: pageLoadTiming
      });
      return true; // Indica que a resposta será assíncrona
    }

    if (request.action === 'getActiveTabContainers') {
      console.log(`[GTM Size] Solicitando containers da aba ativa (${activeTabId})`);
      const containers = activeTabId && containersByTab[activeTabId] ? containersByTab[activeTabId] : {};
      console.log(`[GTM Size] Retornando ${Object.keys(containers).length} containers da aba ativa`);
      sendResponse({
        containers,
        activeTabId,
        pageLoadTiming: pageLoadTiming
      });
      return true; // Indica que a resposta será assíncrona
    }

    // Para outras mensagens, envia uma resposta vazia
    if (sendResponse) {
      sendResponse({
        status: 'ignored'
      });
    }
    return true; // Mantém a porta de comunicação aberta para respostas assíncronas
  });

  // Listener para quando uma aba é ativada
  chrome.tabs.onActivated.addListener(activeInfo => {
    console.log(`[GTM Size] Aba ativada: ${activeInfo.tabId} (window: ${activeInfo.windowId})`);
    activeTabId = activeInfo.tabId;
    // Envia os dados da aba ativa para o sidepanel
    sendContainersToSidePanel(activeTabId);
  });

  // Configurar o sidepanel
  chrome.sidePanel.setOptions({
    path: 'sidepanel.html',
    enabled: true
  }).catch(error => console.error('Failed to set side panel options:', error));

  // Configura o painel lateral quando a extensão é instalada ou atualizada
  chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true
    }).catch(console.error);
  });
})();
/******/ })()
;
//# sourceMappingURL=background.js.map