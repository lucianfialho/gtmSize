/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/background/constants.js
/**
 * Configuration constants for GTM Size Extension
 */
const CONFIG = {
  // GTM Configuration
  MAX_GTM_SIZE: 200 * 1024,
  // 200KB in bytes
  GTM_SIZE_LIMIT_PERCENT: 100,
  // 100% of MAX_GTM_SIZE

  // Cache Configuration
  CACHE_TTL: 5 * 60 * 1000,
  // 5 minutes in milliseconds
  MAX_CACHE_ENTRIES: 50,
  // Cleanup Configuration
  CLEANUP_INTERVAL: 60 * 1000,
  // 1 minute in milliseconds
  MAX_TAB_HISTORY: 10,
  // Request Configuration
  REQUEST_TIMEOUT: 15000,
  // 15 seconds
  MAX_CONCURRENT_REQUESTS: 3,
  // Memory Configuration
  MAX_MEMORY_USAGE: 10 * 1024 * 1024,
  // 10MB
  MEMORY_CHECK_INTERVAL: 2 * 60 * 1000 // 2 minutes
};

/**
 * Cache key prefixes
 */
const CACHE_KEYS = {
  CONTAINERS: 'containers_',
  PERFORMANCE: 'performanceStats',
  MEMORY_HISTORY: 'memoryHistory'
};

/**
 * Error messages
 */
const ERROR_MESSAGES = {
  NO_ACTIVE_TAB: 'Nenhuma aba ativa encontrada',
  INVALID_GTM_URL: 'URL não parece ser um script GTM válido',
  FETCH_TIMEOUT: 'Timeout ao buscar dados do GTM',
  PARSING_ERROR: 'Erro ao fazer parse do JSON',
  CACHE_ERROR: 'Erro ao acessar cache',
  NETWORK_ERROR: 'Erro de rede ou URL inválida',
  FETCH_ERROR: 'Erro ao buscar dados do GTM',
  SIDE_PANEL_ERROR: 'Erro ao configurar o painel lateral',
  SIDE_PANEL_OPEN_ERROR: 'Erro ao abrir o painel lateral'
};

/**
 * Regular expressions for GTM detection
 */
const GTM_PATTERNS = {
  OFFICIAL_GOOGLE: /https:\/\/www\.googletagmanager\.com\/gtm\.js/,
  GENERIC_GTM: /\/gtm\.js\?id=GTM-[A-Z0-9]+/,
  BROAD_GTM: /gtm\.js\?id=GTM-[A-Z0-9-]+/
};

/**
 * GTM URL patterns for proxy detection
 */
const GTM_PROXY_INDICATORS = ['/gtm.js', '/gtag/js', '/gtm.'];

/**
 * Mapping of GTM tag types to friendly names and categories
 * Used for tag identification and categorization in the UI
 */
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
  // Custom Tags
  'html': {
    name: 'Custom HTML',
    category: 'custom'
  },
  'img': {
    name: 'Custom Image',
    category: 'custom'
  },
  // Analytics Tags
  'cegg': {
    name: 'Crazy Egg',
    category: 'analytics'
  },
  'mf': {
    name: 'Mouseflow',
    category: 'analytics'
  },
  'vdc': {
    name: 'VisualDNA',
    category: 'analytics'
  },
  'tdc': {
    name: 'Turn Data Collection',
    category: 'analytics'
  },
  'tc': {
    name: 'Turn Conversion',
    category: 'analytics'
  },
  'placedPixel': {
    name: 'Placed',
    category: 'analytics'
  },
  'ndcr': {
    name: 'Nielsen DCR',
    category: 'analytics'
  },
  'ljs': {
    name: 'Lytics JS',
    category: 'analytics'
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
  'cts': {
    name: 'ClickTale',
    category: 'analytics'
  },
  'csm': {
    name: 'comScore',
    category: 'analytics'
  },
  'adm': {
    name: 'Adometry',
    category: 'analytics'
  },
  // Social Media Tags
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
  'okt': {
    name: 'Oktopost',
    category: 'social'
  },
  'shareaholic': {
    name: 'Shareaholic',
    category: 'social'
  },
  // Advertising Tags
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
  'baut': {
    name: 'Bing Universal',
    category: 'advertising'
  },
  'asp': {
    name: 'AdRoll Smart Pixel',
    category: 'advertising'
  },
  'ta': {
    name: 'AdAdvisor/Neustar',
    category: 'advertising'
  },
  // Marketing Tags
  'scjs': {
    name: 'SaleCycle JS',
    category: 'marketing'
  },
  'scp': {
    name: 'SaleCycle Pixel',
    category: 'marketing'
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
  'uslt': {
    name: 'Upsellit Footer',
    category: 'marketing'
  },
  'uspt': {
    name: 'Upsellit Confirmation',
    category: 'marketing'
  },
  'll': {
    name: 'LeadLab',
    category: 'marketing'
  },
  // Affiliate Tags
  'tdsc': {
    name: 'Tradedoubler Sale',
    category: 'affiliate'
  },
  'tdlc': {
    name: 'Tradedoubler Lead',
    category: 'affiliate'
  },
  'awj': {
    name: 'Affiliate Window',
    category: 'affiliate'
  },
  'awc': {
    name: 'Affiliate Window Conv',
    category: 'affiliate'
  },
  // Feedback Tags
  'svw': {
    name: 'Survicate',
    category: 'feedback'
  },
  'bb': {
    name: 'Bizrate Buyer',
    category: 'feedback'
  },
  'bsa': {
    name: 'Bizrate Survey',
    category: 'feedback'
  },
  'nudge': {
    name: 'Nudge',
    category: 'feedback'
  },
  // Testing Tags
  'abtGeneric': {
    name: 'AB Tasty',
    category: 'testing'
  },
  // Chat Tags
  'messagemate': {
    name: 'Message Mate',
    category: 'chat'
  },
  // Content Tags
  'dstag': {
    name: 'DistroScale',
    category: 'content'
  },
  // Personalization Tags
  'pc': {
    name: 'Personali Canvas',
    category: 'personalization'
  },
  // Other Tags
  'zone': {
    name: 'Zonas',
    category: 'other'
  }
};

/**
 * Friendly names for tag categories used in UI display
 */
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

/**
 * Mapping of GTM macro (variable) types to friendly names
 * Used for variable identification in container analysis
 */
const MACRO_TYPES = {
  'k': 'Primary Cookie',
  'v': 'Auto Event Variable',
  'c': 'Constant',
  'ctv': 'Container Version Number',
  'e': 'Custom Event',
  'jsm': 'JavaScript Variable',
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
  'ct_gtag': 'Google Tag'
};

/**
 * Mapping of GTM trigger types to friendly names
 */
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
;// ./src/background/cache-manager.js
// src/background/cache-manager.js


class CacheManager {
  constructor() {
    // In-memory storage for active containers
    this.containersByTab = {};
    this.lastUrlByTab = {};

    // Configuration from constants
    this.cacheTTL = CONFIG.CACHE_TTL; // 5 minutes
    this.maxCacheEntries = CONFIG.MAX_CACHE_ENTRIES; // 50
    this.maxTabHistory = CONFIG.MAX_TAB_HISTORY; // 10

    console.log('[CacheManager] Initialized with TTL:', this.cacheTTL);
  }

  /**
   * Save containers to both memory and chrome.storage
   * @param {number} tabId - Tab identifier
   * @param {Object} containers - Container data to save
   * @returns {Promise<boolean>} Success status
   */
  async saveContainersToCache(tabId, containers) {
    if (!tabId || !containers) {
      console.warn('[CacheManager] Invalid parameters for saveContainersToCache');
      return false;
    }
    try {
      // Update in-memory cache
      this.containersByTab[tabId] = containers;

      // Prepare data for chrome.storage using CACHE_KEYS
      const cacheKey = `${CACHE_KEYS.CONTAINERS}${tabId}`;
      const cacheData = {
        containers,
        timestamp: Date.now(),
        url: this.lastUrlByTab[tabId] || '',
        version: '2.1.3' // Extension version for cache compatibility
      };

      // Save to chrome.storage
      await chrome.storage.local.set({
        [cacheKey]: cacheData
      });
      console.log(`[CacheManager] Containers saved for tab ${tabId}:`, Object.keys(containers).length, 'containers');
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
      return false;
    }
  }

  /**
   * Load containers from cache (memory first, then chrome.storage)
   * @param {number} tabId - Tab identifier
   * @returns {Promise<Object|null>} Cached containers or null
   */
  async loadContainersFromCache(tabId) {
    if (!tabId) {
      console.warn('[CacheManager] No tabId provided for loadContainersFromCache');
      return null;
    }
    try {
      // Check in-memory cache first (fastest)
      if (this.containersByTab[tabId] && Object.keys(this.containersByTab[tabId]).length > 0) {
        console.log(`[CacheManager] Containers loaded from memory for tab ${tabId}`);
        return this.containersByTab[tabId];
      }

      // Check chrome.storage cache using CACHE_KEYS
      const cacheKey = `${CACHE_KEYS.CONTAINERS}${tabId}`;
      const result = await chrome.storage.local.get(cacheKey);
      const cachedData = result[cacheKey];

      // Validate cache data
      if (!cachedData || !cachedData.containers) {
        console.log(`[CacheManager] No cached data found for tab ${tabId}`);
        return null;
      }

      // Check if cache is still valid (TTL check)
      const isExpired = Date.now() - cachedData.timestamp > this.cacheTTL;
      if (isExpired) {
        console.log(`[CacheManager] Cache expired for tab ${tabId}, removing...`);
        await this.removeCacheEntry(tabId);
        return null;
      }

      // Cache is valid, restore to memory and return
      this.containersByTab[tabId] = cachedData.containers;
      console.log(`[CacheManager] Containers loaded from storage for tab ${tabId}:`, Object.keys(cachedData.containers).length, 'containers');
      return cachedData.containers;
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   * @param {number} tabId - Tab identifier
   */
  async removeCacheEntry(tabId) {
    try {
      const cacheKey = `${CACHE_KEYS.CONTAINERS}${tabId}`;
      await chrome.storage.local.remove(cacheKey);
      console.log(`[CacheManager] Removed cache entry for tab ${tabId}`);
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
    }
  }

  /**
   * Update the last known URL for a tab
   * @param {number} tabId - Tab identifier
   * @param {string} url - Current tab URL
   */
  setTabUrl(tabId, url) {
    if (!tabId || !url) return;

    // Check if URL actually changed
    if (this.lastUrlByTab[tabId] === url) {
      return; // No change, skip update
    }
    const previousUrl = this.lastUrlByTab[tabId];
    this.lastUrlByTab[tabId] = url;

    // If URL changed, clear containers for this tab
    if (previousUrl && previousUrl !== url) {
      console.log(`[CacheManager] URL changed for tab ${tabId}, clearing containers`);
      this.clearTabContainers(tabId);
    }
  }

  /**
   * Get containers for a specific tab
   * @param {number} tabId - Tab identifier
   * @returns {Object} Containers object or empty object
   */
  getTabContainers(tabId) {
    if (!tabId) return {};
    return this.containersByTab[tabId] || {};
  }

  /**
   * Add or update a container for a specific tab
   * @param {number} tabId - Tab identifier
   * @param {string} containerId - Container ID (e.g., GTM-XXXXXX)
   * @param {Object} containerData - Container information
   */
  setContainer(tabId, containerId, containerData) {
    if (!tabId || !containerId || !containerData) {
      console.warn('[CacheManager] Invalid parameters for setContainer');
      return;
    }

    // Initialize tab containers if needed
    if (!this.containersByTab[tabId]) {
      this.containersByTab[tabId] = {};
    }

    // Add timestamp to container data
    containerData.timestamp = Date.now();

    // Store container
    this.containersByTab[tabId][containerId] = containerData;
    console.log(`[CacheManager] Container ${containerId} updated for tab ${tabId}`);

    // Auto-save to persistent storage
    this.saveContainersToCache(tabId, this.containersByTab[tabId]).catch(console.error);
  }

  /**
   * Clear all containers for a specific tab
   * @param {number} tabId - Tab identifier
   */
  clearTabContainers(tabId) {
    if (!tabId) return;

    // Clear from memory
    delete this.containersByTab[tabId];

    // Clear from storage
    this.removeCacheEntry(tabId).catch(console.error);
    console.log(`[CacheManager] Cleared all containers for tab ${tabId}`);
  }

  /**
   * Clean up data for a closed tab
   * @param {number} tabId - Tab identifier
   */
  cleanupTab(tabId) {
    if (!tabId) return;

    // Remove from both memory stores
    delete this.containersByTab[tabId];
    delete this.lastUrlByTab[tabId];

    // Remove from persistent storage
    this.removeCacheEntry(tabId).catch(console.error);
    console.log(`[CacheManager] Cleaned up data for closed tab ${tabId}`);
  }

  /**
   * Save performance stats to chrome.storage
   * @param {Object} stats - Performance statistics
   */
  async savePerformanceStats(stats) {
    try {
      const cacheKey = CACHE_KEYS.PERFORMANCE;
      await chrome.storage.local.set({
        [cacheKey]: {
          ...stats,
          timestamp: Date.now()
        }
      });
      console.log('[CacheManager] Performance stats saved');
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
    }
  }

  /**
   * Load performance stats from chrome.storage
   * @returns {Promise<Object|null>} Performance stats or null
   */
  async loadPerformanceStats() {
    try {
      const cacheKey = CACHE_KEYS.PERFORMANCE;
      const result = await chrome.storage.local.get(cacheKey);
      return result[cacheKey] || null;
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
      return null;
    }
  }

  /**
   * Save memory history to chrome.storage
   * @param {Array} memoryHistory - Array of memory usage snapshots
   */
  async saveMemoryHistory(memoryHistory) {
    try {
      const cacheKey = CACHE_KEYS.MEMORY_HISTORY;

      // Keep only last 24 hours (assuming 2-minute intervals = 720 entries)
      const maxEntries = 720;
      if (memoryHistory.length > maxEntries) {
        memoryHistory.splice(0, memoryHistory.length - maxEntries);
      }
      await chrome.storage.local.set({
        [cacheKey]: memoryHistory
      });
      console.log('[CacheManager] Memory history saved');
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
    }
  }

  /**
   * Load memory history from chrome.storage
   * @returns {Promise<Array>} Memory history array
   */
  async loadMemoryHistory() {
    try {
      const cacheKey = CACHE_KEYS.MEMORY_HISTORY;
      const result = await chrome.storage.local.get(cacheKey);
      return result[cacheKey] || [];
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
      return [];
    }
  }

  /**
   * Clean up expired cache entries across all cache types
   */
  async cleanupExpiredCache() {
    try {
      const allData = await chrome.storage.local.get(null);
      const now = Date.now();
      const keysToRemove = [];
      for (const [key, value] of Object.entries(allData)) {
        // Check container cache entries
        if (key.startsWith(CACHE_KEYS.CONTAINERS) && value.timestamp) {
          if (now - value.timestamp > this.cacheTTL) {
            keysToRemove.push(key);
          }
        }

        // Check performance stats (keep for 24 hours)
        if (key === CACHE_KEYS.PERFORMANCE && value.timestamp) {
          const performanceTTL = 24 * 60 * 60 * 1000; // 24 hours
          if (now - value.timestamp > performanceTTL) {
            keysToRemove.push(key);
          }
        }
      }
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log(`[CacheManager] Removed ${keysToRemove.length} expired cache entries`);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.CACHE_ERROR, error);
    }
  }

  /**
   * Get current cache statistics for debugging
   */
  getStats() {
    const totalTabs = Object.keys(this.containersByTab).length;
    const totalContainers = Object.values(this.containersByTab).reduce((total, containers) => total + Object.keys(containers).length, 0);
    return {
      totalTabs,
      totalContainers,
      lastUrlCount: Object.keys(this.lastUrlByTab).length,
      cacheTTL: this.cacheTTL,
      maxCacheEntries: this.maxCacheEntries,
      maxTabHistory: this.maxTabHistory
    };
  }
}
;// ./src/background.js


(function () {
  'use strict';

  console.log('[GTM Size] Background script iniciado');

  // Variáveis de estado
  const cacheManager = new CacheManager();
  const requestTiming = {};
  let pageLoadTiming = null;
  let activeTabId = null;

  // Função para verificar se uma URL é um proxy GTM
  function isGtmProxy(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('googletagmanager.com') && GTM_PROXY_INDICATORS.some(indicator => url.includes(indicator));
    } catch (e) {
      console.error('[GTM Size] URL inválida ao verificar proxy:', url, e);
      return false;
    }
  }

  // Função para verificar se uma URL é uma requisição do GTM
  function isGTMRequest(url) {
    if (!url || typeof url !== 'string') return false;
    return Object.values(GTM_PATTERNS).some(pattern => pattern.test(url));
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
      let containers = cacheManager.getTabContainers(tabId);
      if (!containers || Object.keys(containers).length === 0) {
        console.log(`[GTM Size] Nenhum container encontrado na memória para a tab ${tabId}, verificando cache...`);
        containers = (await cacheManager.loadContainersFromCache(tabId)) || {};
      }

      // Envia os containers para o sidepanel
      await sendToSidepanel({
        action: 'updateContainers',
        containers,
        pageLoadTiming: pageLoadTiming,
        timestamp: Date.now(),
        tabId: tabId,
        fromCache: Object.keys(containers).length === 0
      });

      // Atualiza o cache se necessário
      if (Object.keys(containers).length > 0) {
        await cacheManager.saveContainersToCache(tabId, containers);
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
  function sizeByGoogleTagManagerLimit(sizeOfContainer = 0) {
    return Math.round(sizeOfContainer / CONFIG.MAX_GTM_SIZE * 100);
  }

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
    const sortedTags = Object.entries(tagData).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    const sortedTriggers = Object.entries(triggerData).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    const sortedMacros = Object.entries(macroData).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
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
      console.error(ERROR_MESSAGES.INVALID_GTM_URL, url);
      return {
        version: null,
        macros: null,
        predicates: null,
        tags: null,
        rules: null
      };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
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
        console.error(ERROR_MESSAGES.PARSING_ERROR, parseError);
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
        console.error(ERROR_MESSAGES.FETCH_TIMEOUT);
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

        // Store container using CacheManager
        cacheManager.setContainer(details.tabId, containerId, containerData);
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
        const tabContainers = cacheManager.getTabContainers(details.tabId);
        const numberOfContainers = Object.keys(tabContainers).length;
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
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    if (request.action === 'getContainers') {
      const tabId = request.tabId;
      console.log('Getting containers for tab:', tabId);

      // Use CacheManager instead of direct access
      let containers = cacheManager.getTabContainers(tabId);
      if (!containers || Object.keys(containers).length === 0) {
        console.log('No containers in memory, checking cache...');
        containers = (await cacheManager.loadContainersFromCache(tabId)) || {};
      }
      if (Object.keys(containers).length > 0) {
        console.log('Returning containers for tab', tabId, ':', containers);

        // Enviar os containers para o painel lateral
        chrome.runtime.sendMessage({
          type: 'CONTAINERS_UPDATED',
          tabId: tabId,
          containers: containers
        });
        sendResponse({
          containers: containers
        });
      } else {
        console.log('No containers found for tab', tabId);
        sendResponse({
          containers: {}
        });
      }
      return true;
    }
    if (request.time) {
      pageLoadTiming = request.time;
      console.log('Page load timing updated:', pageLoadTiming);
    }

    // If no tabId is provided, try to get the active tab
    if (!request.tabId && sender.tab) {
      request.tabId = sender.tab.id;
    }
    if (request.tabId !== undefined) {
      let containers = cacheManager.getTabContainers(request.tabId);
      if (!containers || Object.keys(containers).length === 0) {
        containers = (await cacheManager.loadContainersFromCache(request.tabId)) || {};
      }
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
    return true;
  });

  // Listener para quando uma aba é removida
  chrome.tabs.onRemoved.addListener(tabId => {
    cacheManager.cleanupTab(tabId);
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
      cacheManager.setTabUrl(tabId, tab.url);
      // Se for a aba ativa, atualiza o sidepanel
      if (activeTabId === tabId) {
        sendContainersToSidePanel(tabId);
      }
    }
  });

  // Abrir o sidepanel quando o ícone da extensão for clicado
  chrome.action.onClicked.addListener(async tab => {
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
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('[GTM Size] Mensagem recebida no background:', request);
    if (request.action === 'getContainers') {
      console.log(`[GTM Size] Solicitando containers para a tab ${request.tabId}`);
      const tabId = request.tabId || activeTabId;
      let containers = tabId ? cacheManager.getTabContainers(tabId) : {};
      if (!containers || Object.keys(containers).length === 0) {
        // fallback to cache
        containers = (await cacheManager.loadContainersFromCache(tabId)) || {};
      }
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
      let containers = activeTabId ? cacheManager.getTabContainers(activeTabId) : {};
      if (!containers || Object.keys(containers).length === 0) {
        containers = (await cacheManager.loadContainersFromCache(activeTabId)) || {};
      }
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