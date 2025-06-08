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
;// ./src/background/container-analyzer.js
// src/background/container-analyzer.js


class ContainerAnalyzer {
  constructor() {
    // Request caching to avoid duplicate fetches
    this.analysisCache = new Map();
    this.pendingRequests = new Map();

    // Configuration
    this.requestTimeout = CONFIG.REQUEST_TIMEOUT;
    this.maxCacheSize = CONFIG.MAX_CACHE_ENTRIES || 50;
    this.cacheTTL = CONFIG.CACHE_TTL;
    console.log('[ContainerAnalyzer] Initialized with caching');
  }

  /**
   * Clear expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let removedCount = 0;
    for (const [url, entry] of this.analysisCache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.analysisCache.delete(url);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`[ContainerAnalyzer] Cleaned up ${removedCount} expired cache entries`);
    }
  }

  /**
   * Enforce cache size limits
   */
  enforceCacheSize() {
    if (this.analysisCache.size <= this.maxCacheSize) return;

    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(this.analysisCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries
    const toRemove = this.analysisCache.size - this.maxCacheSize;
    for (let i = 0; i < toRemove; i++) {
      this.analysisCache.delete(entries[i][0]);
    }
    console.log(`[ContainerAnalyzer] Removed ${toRemove} old cache entries to enforce size limit`);
  }

  /**
   * Get current analyzer statistics for debugging
   */
  getStats() {
    return {
      cacheSize: this.analysisCache.size,
      pendingRequests: this.pendingRequests.size,
      maxCacheSize: this.maxCacheSize,
      cacheTTL: this.cacheTTL
    };
  }

  /**
   * Get friendly name and category for a GTM tag
   * @param {string} tagId - Raw tag identifier
   * @returns {Object} Object with name and category
   */
  getFriendlyTagName(tagId) {
    // Verifica se é um template customizado
    if (tagId && tagId.startsWith('cvt_')) {
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
      name: tagId && tagId.startsWith('_') ? tagId.substring(1) : tagId || 'Unknown',
      category: 'Other'
    };
  }

  /**
   * Categorize tags by their categories for UI display
   * @param {Object} tagsByName - Tags grouped by name
   * @returns {Object} Tags grouped by category
   */
  categorizeTagsByCategory(tagsByName) {
    const byCategory = {};
    const byType = {};
    for (const [tagName, count] of Object.entries(tagsByName)) {
      // Try to determine the original tag ID to get category
      // This is a reverse lookup - not perfect but functional
      let category = 'Other';

      // Check if it's a known tag name
      for (const [tagId, tagInfo] of Object.entries(KNOWN_TAGS)) {
        if (tagInfo.name === tagName) {
          category = CATEGORY_NAMES[tagInfo.category] || 'Other';
          break;
        }
      }

      // Special cases
      if (tagName === 'Custom Template') category = 'Custom';
      if (tagName.includes('Google')) category = 'Google';
      if (tagName.includes('Analytics')) category = 'Analytics';

      // Update counters
      byCategory[category] = (byCategory[category] || 0) + count;
      byType[tagName] = count;
    }
    return {
      byCategory,
      byType
    };
  }

  /**
   * Extract and process GTM container resource details
   * @param {Object} resourceObj - Raw GTM resource object
   * @returns {Object} Processed container analysis
   */
  extractResourceDetails(resourceObj) {
    if (!resourceObj || typeof resourceObj !== 'object') {
      console.warn('[ContainerAnalyzer] Invalid resource object provided');
      return this.getEmptyAnalysis();
    }
    try {
      // Extract basic fields
      const version = resourceObj.version || null;
      const macros = Array.isArray(resourceObj.macros) ? resourceObj.macros : [];
      const predicates = Array.isArray(resourceObj.predicates) ? resourceObj.predicates : [];
      const tagsArr = Array.isArray(resourceObj.tags) ? resourceObj.tags : [];
      const rules = Array.isArray(resourceObj.rules) ? resourceObj.rules : [];

      // Process tags
      const tagResults = this.processTags(tagsArr);

      // Process macros (variables)
      const macroResults = this.processMacros(macros);

      // Process triggers
      const triggerResults = this.processTriggers(tagsArr);
      return {
        version,
        macros: macroResults,
        predicates,
        tags: tagResults,
        triggers: triggerResults,
        rules,
        processedAt: Date.now()
      };
    } catch (error) {
      console.error('[ContainerAnalyzer] Error processing resource details:', error);
      return this.getEmptyAnalysis();
    }
  }

  /**
   * Process GTM tags and filter valid ones
   * @param {Array} tagsArr - Array of tag objects
   * @returns {Object} Processed tag data
   */
  processTags(tagsArr) {
    // Filter valid tags (not variables or triggers)
    const validTags = tagsArr.filter(tag => {
      if (!tag || !tag.function) return false;

      // Ignore common variables and triggers
      const ignoreList = ['cl', 'evl', 'fsl', 'lcl', 'sdl', 'dl', 'ev', 'f', 'v'];
      const tagId = tag.function.startsWith('__') ? tag.function.substring(2) : tag.function;

      // Include custom templates or tags not in ignore list
      return tag.function.startsWith('cvt_') || !ignoreList.includes(tagId);
    });

    // Process tags to count by name
    const tagData = {};
    validTags.forEach(tag => {
      const tagId = tag.function.startsWith('__') ? tag.function.substring(2) : tag.function;
      const tagInfo = this.getFriendlyTagName(tagId);

      // Use custom name if available, otherwise use friendly name
      const displayName = tag.tagName || tag.name || tagInfo.name;
      if (!tagData[displayName]) {
        tagData[displayName] = 0;
      }
      tagData[displayName]++;
    });

    // Sort tags alphabetically
    const sortedTags = Object.entries(tagData).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));

    // Categorize tags
    const categorized = this.categorizeTagsByCategory(tagData);
    return {
      byName: Object.fromEntries(sortedTags),
      total: validTags.length,
      ...categorized
    };
  }

  /**
   * Process GTM macros (variables)
   * @param {Array} macros - Array of macro objects
   * @returns {Object} Processed macro data
   */
  processMacros(macros) {
    const macroData = {};
    macros.forEach(macro => {
      if (!macro || !macro.function) return;

      // Clean up macro function name
      const macroFunction = macro.function.startsWith('__') ? macro.function.substring(2) : macro.function;

      // Get macro name (custom name or mapped name)
      if (MACRO_TYPES[macroFunction] || macro.name) {
        const macroName = macro.name || MACRO_TYPES[macroFunction];
        if (macroName) {
          if (!macroData[macroName]) {
            macroData[macroName] = 0;
          }
          macroData[macroName]++;
        }
      }
    });

    // Sort macros alphabetically
    const sortedMacros = Object.entries(macroData).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    return {
      byName: Object.fromEntries(sortedMacros),
      total: Object.values(macroData).reduce((sum, count) => sum + count, 0)
    };
  }

  /**
   * Process GTM triggers from tags
   * @param {Array} tagsArr - Array of tag objects
   * @returns {Object} Processed trigger data
   */
  processTriggers(tagsArr) {
    const triggerData = {};
    const triggerIds = ['evl', 'cl', 'fsl', 'hl', 'jel', 'lcl', 'sdl', 'tl', 'ytl'];
    tagsArr.forEach(tag => {
      if (!tag || !tag.function) return;

      // Extract tag ID
      const tagId = tag.function.startsWith('__') ? tag.function.substring(2) : tag.function;

      // Check if it's a known trigger
      if (triggerIds.includes(tagId)) {
        const triggerName = TRIGGER_TYPES[tagId] || tagId;
        if (!triggerData[triggerName]) {
          triggerData[triggerName] = 0;
        }
        triggerData[triggerName]++;
      }
    });

    // Sort triggers alphabetically
    const sortedTriggers = Object.entries(triggerData).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    return {
      byName: Object.fromEntries(sortedTriggers),
      total: Object.values(triggerData).reduce((sum, count) => sum + count, 0)
    };
  }

  /**
   * Get empty analysis structure for error cases
   * @returns {Object} Empty analysis object
   */
  getEmptyAnalysis() {
    return {
      version: null,
      macros: {
        byName: {},
        total: 0
      },
      predicates: [],
      tags: {
        byName: {},
        total: 0,
        byCategory: {},
        byType: {}
      },
      triggers: {
        byName: {},
        total: 0
      },
      rules: [],
      processedAt: Date.now()
    };
  }

  /**
   * Fetch and analyze GTM container data with caching
   * @param {string} url - GTM script URL
   * @returns {Promise<Object>} Container analysis or null
   */
  async fetchGTMData(url) {
    // Input validation
    if (!url || typeof url !== 'string') {
      console.error('[ContainerAnalyzer] Invalid URL provided:', url);
      return this.getEmptyAnalysis();
    }

    // Check cache first
    const cached = this.analysisCache.get(url);
    if (cached && this.isCacheValid(cached)) {
      console.log(`[ContainerAnalyzer] Cache hit for: ${url}`);
      return cached.data;
    }

    // Check if request is already pending (deduplication)
    if (this.pendingRequests.has(url)) {
      console.log(`[ContainerAnalyzer] Request already pending for: ${url}`);
      return this.pendingRequests.get(url);
    }

    // Validate URL patterns
    if (!this.isValidGTMUrl(url)) {
      console.error(ERROR_MESSAGES.INVALID_GTM_URL, url);
      return this.getEmptyAnalysis();
    }

    // Create new request promise
    const requestPromise = this.performGTMFetch(url);
    this.pendingRequests.set(url, requestPromise);
    try {
      const result = await requestPromise;

      // Cache successful result
      this.analysisCache.set(url, {
        data: result,
        timestamp: Date.now()
      });

      // Cleanup cache if needed
      this.enforceCacheSize();
      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(url);
    }
  }

  /**
   * Check if cached entry is still valid
   * @param {Object} cached - Cached entry
   * @returns {boolean} True if cache is valid
   */
  isCacheValid(cached) {
    if (!cached || !cached.timestamp) return false;
    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  /**
   * Validate if URL is a valid GTM script URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid GTM URL
   */
  isValidGTMUrl(url) {
    try {
      const urlObj = new URL(url);

      // Check for GTM patterns
      const hasGTMPattern = Object.values(GTM_PATTERNS).some(pattern => pattern.test(url));

      // Check for proxy indicators
      const hasProxyIndicator = GTM_PROXY_INDICATORS.some(indicator => url.includes(indicator));
      return hasGTMPattern || urlObj.hostname.includes('googletagmanager.com') && hasProxyIndicator;
    } catch (e) {
      return false;
    }
  }

  /**
   * Perform the actual GTM script fetch and parsing
   * @param {string} url - GTM script URL
   * @returns {Promise<Object>} Parsed container data
   */
  async performGTMFetch(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
    try {
      console.log('[ContainerAnalyzer] Fetching GTM data from:', url);
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
        throw new Error('Empty or invalid response from server');
      }

      // Parse the GTM script
      return this.parseGTMScript(scriptString);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(ERROR_MESSAGES.FETCH_TIMEOUT);
      } else if (error instanceof TypeError) {
        console.error('[ContainerAnalyzer] Network error:', error.message);
      } else {
        console.error('[ContainerAnalyzer] Fetch error:', error);
      }
      return this.getEmptyAnalysis();
    }
  }

  /**
   * Parse GTM script content to extract JSON data
   * @param {string} scriptString - Raw script content
   * @returns {Object} Parsed container analysis
   */
  parseGTMScript(scriptString) {
    try {
      // Find the data object
      const dataStart = scriptString.indexOf('var data = ');
      if (dataStart === -1) {
        console.error('[ContainerAnalyzer] Data object not found in script');
        return this.getEmptyAnalysis();
      }

      // Find JSON start
      const jsonStart = scriptString.indexOf('{', dataStart);
      if (jsonStart === -1) {
        console.error('[ContainerAnalyzer] JSON start not found');
        return this.getEmptyAnalysis();
      }

      // Find JSON end using brace counting
      const jsonEnd = this.findJsonEnd(scriptString, jsonStart);
      if (jsonEnd === -1) {
        console.error('[ContainerAnalyzer] Could not find JSON end');
        return this.getEmptyAnalysis();
      }

      // Extract and parse JSON
      const jsonStr = scriptString.substring(jsonStart, jsonEnd);
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data returned by GTM');
      }

      // Process the resource data
      const result = this.extractResourceDetails(data.resource || data);
      if (!result) {
        throw new Error('Failed to process GTM data');
      }
      return result;
    } catch (parseError) {
      console.error(ERROR_MESSAGES.PARSING_ERROR, parseError);
      return this.getEmptyAnalysis();
    }
  }

  /**
   * Find the end of JSON object using brace counting
   * @param {string} scriptString - Script content
   * @param {number} jsonStart - Starting position
   * @returns {number} End position or -1 if not found
   */
  findJsonEnd(scriptString, jsonStart) {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    for (let i = jsonStart; i < scriptString.length; i++) {
      const char = scriptString[i];
      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      // Handle escape characters
      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      // Handle string boundaries
      if (char === '"') {
        inString = !inString;
        continue;
      }

      // Count braces only outside of strings
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return i + 1;
          }
        }
      }
    }
    return -1; // JSON end not found
  }
}
;// ./src/background.js


(function () {
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
      const cacheKey = `${CACHE_KEYS.CONTAINERS}${tabId}`;
      const result = await chrome.storage.local.get(cacheKey);
      const cachedData = result[cacheKey];

      // Verifica se o cache é válido (menos de 5 minutos)
      if (cachedData && Date.now() - cachedData.timestamp < CONFIG.CACHE_TTL) {
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
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: {
          tabId: tabId
        },
        func: () => performance.timing.loadEventEnd - performance.timing.navigationStart
      }, results => {
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
        containers = (await loadContainersFromCache(tabId)) || {};
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
        containers = (await loadContainersFromCache(activeTabId)) || {};
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
      sendResponse({
        status: 'timing_updated'
      });
      return true;
    }

    // Handle legacy requests
    if (request.tabId !== undefined) {
      let containers = containersByTab[request.tabId] || {};
      if (Object.keys(containers).length === 0) {
        containers = (await loadContainersFromCache(request.tabId)) || {};
      }
      console.log('Returning containers for tab', request.tabId, ':', containers);
      sendResponse({
        containers: containers,
        pageLoadTiming: pageLoadTiming || 0
      });
      return true;
    }

    // Default response for other messages
    sendResponse({
      status: 'ignored'
    });
    return true;
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
  console.log('[GTM Size] Background script initialized with ContainerAnalyzer');
})();
/******/ })()
;
//# sourceMappingURL=background.js.map