import {
  CONFIG,
  CACHE_KEYS,
  ERROR_MESSAGES
} from './background/constants.js';
import { ContainerAnalyzer } from './background/container-analyzer.js';

(function() {
  'use strict';
  
  console.log('[GTM Size] Background script iniciado');
  
  // Variáveis de estado
  const containersByTab = {};
  const requestTiming = {};
  let pageLoadTiming = null;
  const lastUrlByTab = {};
  let activeTabId = null;

  // Create ContainerAnalyzer instance
  const containerAnalyzer = new ContainerAnalyzer();

  // Função para salvar containers no cache
  async function saveContainersToCache(tabId, containers) {
    if (!tabId || !containers) return;
    
    try {
      const cacheKey = `${CACHE_KEYS.CONTAINERS}${tabId}`;
      await chrome.storage.local.set({ [cacheKey]: {
        containers,
        timestamp: Date.now(),
        url: lastUrlByTab[tabId] || ''
      }});
      console.log(`[GTM Size] Containers salvos no cache para a tab ${tabId}`);
    } catch (error) {
      console.error('[GTM Size] Erro ao salvar containers no cache:', error);
    }
  }

  // Função para carregar containers do cache
  async function loadContainersFromCache(tabId) {
    if (!tabId) return null;
    
    try {
      const cacheKey = `${CACHE_KEYS.CONTAINERS}${tabId}`;
      const result = await chrome.storage.local.get(cacheKey);
      const cachedData = result[cacheKey];
      
      // Verifica se o cache é válido (menos de 5 minutos)
      if (cachedData && (Date.now() - cachedData.timestamp < CONFIG.CACHE_TTL)) {
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
      return (urlObj.hostname.includes('googletagmanager.com') && 
             (url.includes('/gtm.js') || 
              url.includes('/gtag/js') ||
              url.includes('/gtm.')));
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
      /gtm\.js\?id=GTM-[A-Z0-9-]+/
    ];
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
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
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
    },
    { urls: ["<all_urls>"] }
  );

  // Listener para requisições de script GTM concluídas
  chrome.webRequest.onCompleted.addListener(
    async (details) => {
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
          const contentLengthHeader = details.responseHeaders?.find(
            (header) => header.name.toLowerCase() === "content-length"
          );
          
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
            
            console.log(`[GTM Size] Fetched size: ${contentLengthInKb}KB` + 
                       (isCompressed ? ` (compressed with ${contentEncoding})` : ''));
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

          // Use ContainerAnalyzer instead of direct fetchGTMData
          const analyse = await containerAnalyzer.fetchGTMData(gtmUrl);
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
          setBadgeInfo(
            contentLengthInKb,
            containerSize,
            details.tabId,
            numberOfContainers
          );
          
          // Clean up the timing data
          delete requestTiming[details.requestId];
        } catch (error) {
          console.error('[GTM Size] Error processing container data:', error);
          return; // Exit if there was an error
        }
      } catch (error) {
        console.error('Error processing GTM script:', error);
      }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );

  // Listener para navegação concluída
  chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) { // Apenas no frame principal
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: () => performance.timing.loadEventEnd - performance.timing.navigationStart,
      }, (results) => {
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
    
    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({ color, tabId });
    
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
        console.error(ERROR_MESSAGES.NO_ACTIVE_TAB);
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

  async function sendToSidepanel(message, attempt = 1) {
    const maxAttempts = 3;
    const retryDelay = 500;
    
    const targetTabId = message.tabId || activeTabId;
    
    if (targetTabId === null || targetTabId === undefined) {
      console.log(ERROR_MESSAGES.NO_ACTIVE_TAB);
      return Promise.resolve();
    }

    // Se não for uma mensagem de atualização de containers, ignora silenciosamente
    if (message.action !== 'updateContainers' && message.action !== 'getContainers') {
      return Promise.resolve();
    }

    console.log(`[GTM Size] [Tentativa ${attempt}/${maxAttempts}] Enviando mensagem para o sidepanel, tabId: ${targetTabId}`, message.action);
    
    try {
      // Verifica se o sidepanel está aberto antes de tentar enviar a mensagem
      const isSidePanelOpen = await chrome.sidePanel.getOptions({ tabId: targetTabId })
        .then(options => options.enabled)
        .catch(() => false);
      
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
      const isConnectionError = error.message.includes('Could not establish connection') || 
                               error.message.includes('Receiving end does not exist') ||
                               error.message.includes('Could not connect to port');
      
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
    return new Promise((resolve) => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => performance.timing.loadEventEnd - performance.timing.navigationStart,
      }, (results) => {
        if (results && results[0]) {
          const loadTime = results[0].result / 1000; // Convert to seconds
          console.log('Page Load Time:', loadTime, 'seconds');
          resolve(loadTime);
        } else {
          resolve(pageLoadTiming || 0);
        }
      });
    });
  }

  function setBadgeInfo(contentLengthInKb, containerSize, tabId, numberOfContainers) {
    if (contentLengthInKb === undefined || containerSize === undefined || tabId === undefined) {
      console.error('Missing required parameters for setBadgeInfo:', { contentLengthInKb, containerSize, tabId });
      return;
    }
    
    console.log('Setting badge info for tab', tabId, 'with size', contentLengthInKb, 'KB and percentage', containerSize);
    
    const text = numberOfContainers > 1 ? 
      `${numberOfContainers} (${containerSize}%)` :
      `${containerSize}%`;
    
    chrome.action.setBadgeText({
      text,
      tabId: tabId
    });
    
    // Definir cor do badge baseado no tamanho do container
    const color = containerSize > 80 ? '#f44336' : 
                  containerSize > 60 ? '#ff9800' : 
                  '#4CAF50';
    
    chrome.action.setBadgeBackgroundColor({
      color,
      tabId: tabId
    });
  }

  function sizeByGoogleTagManagerLimit(sizeOfContainer = 0) {
    return Math.round((sizeOfContainer / CONFIG.MAX_GTM_SIZE) * 100);
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
      console.error(ERROR_MESSAGES.SIDE_PANEL_ERROR, error);
    }
  }

  // Configura o painel lateral quando a extensão é instalada ou atualizada
  chrome.runtime.onInstalled.addListener(() => {
    setupSidePanel();
  });

  // Abrir o painel lateral quando o ícone da extensão for clicado
  chrome.action.onClicked.addListener(async (tab) => {
    console.log(`[GTM Size] Ícone clicado na aba ${tab.id} (${tab.url})`);
    try {
      // Atualiza a aba ativa quando o ícone é clicado
      activeTabId = tab.id;
      console.log(`[GTM Size] Aba ativa definida como: ${activeTabId}`);
      
      // Primeiro abre o sidepanel
      console.log(`[GTM Size] Abrindo sidepanel...`);
      await chrome.sidePanel.open({ windowId: tab.windowId });
      
      // Pequeno delay para garantir que o sidepanel foi carregado
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Depois de abrir o sidepanel, envia os dados
      console.log(`[GTM Size] Enviando containers para o sidepanel...`);
      sendContainersToSidePanel(tab.id);
      
      console.log(`[GTM Size] Sidepanel aberto com sucesso`);
    } catch (error) {
      console.error(ERROR_MESSAGES.SIDE_PANEL_OPEN_ERROR, error);
    }
  });

  // Message listener - consolidado e simplificado
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('[GTM Size] Mensagem recebida no background:', request);
    
    // Handle getContainers action
    if (request.action === 'getContainers') {
      const tabId = request.tabId || activeTabId;
      console.log(`[GTM Size] Solicitando containers para a tab ${tabId}`);
      
      let containers = tabId && containersByTab[tabId] ? containersByTab[tabId] : {};
      
      // Fallback to cache if no containers in memory
      if (Object.keys(containers).length === 0 && tabId) {
        containers = await loadContainersFromCache(tabId) || {};
      }
      
      console.log(`[GTM Size] Retornando ${Object.keys(containers).length} containers`);
      sendResponse({ 
        containers,
        activeTabId: tabId,
        pageLoadTiming: pageLoadTiming || 0
      });
      return true; // Indica que a resposta será assíncrona
    }
    
    // Handle getActiveTabContainers action
    if (request.action === 'getActiveTabContainers') {
      console.log(`[GTM Size] Solicitando containers da aba ativa (${activeTabId})`);
      
      let containers = activeTabId && containersByTab[activeTabId] ? containersByTab[activeTabId] : {};
      
      // Fallback to cache if no containers in memory
      if (Object.keys(containers).length === 0 && activeTabId) {
        containers = await loadContainersFromCache(activeTabId) || {};
      }
      
      console.log(`[GTM Size] Retornando ${Object.keys(containers).length} containers da aba ativa`);
      sendResponse({ 
        containers,
        activeTabId,
        pageLoadTiming: pageLoadTiming || 0
      });
      return true; // Indica que a resposta será assíncrona
    }
    
    // Handle page load timing updates
    if (request.time) {
      pageLoadTiming = request.time;
      console.log('Page load timing updated:', pageLoadTiming);
      sendResponse({ status: 'timing_updated' });
      return true;
    }
    
    // Handle legacy requests
    if (request.tabId !== undefined) {
      let containers = containersByTab[request.tabId] || {};
      
      if (Object.keys(containers).length === 0) {
        containers = await loadContainersFromCache(request.tabId) || {};
      }
      
      console.log('Returning containers for tab', request.tabId, ':', containers);
      sendResponse({
        containers: containers,
        pageLoadTiming: pageLoadTiming || 0
      });
      return true;
    }
    
    // Default response for other messages
    sendResponse({ status: 'ignored' });
    return true;
  });

  // Listener para quando uma aba é removida
  chrome.tabs.onRemoved.addListener((tabId) => {
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

  // Listener para quando uma aba é ativada
  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log(`[GTM Size] Aba ativada: ${activeInfo.tabId} (window: ${activeInfo.windowId})`);
    activeTabId = activeInfo.tabId;
    // Envia os dados da aba ativa para o sidepanel
    sendContainersToSidePanel(activeTabId);
  });

  // Configurar o sidepanel
  chrome.sidePanel
    .setOptions({
      path: 'sidepanel.html',
      enabled: true
    })
    .catch((error) => console.error('Failed to set side panel options:', error));

  console.log('[GTM Size] Background script initialized with ContainerAnalyzer');
})();