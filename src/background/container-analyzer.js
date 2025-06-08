// src/background/container-analyzer.js

import {
  CONFIG,
  KNOWN_TAGS,
  CATEGORY_NAMES,
  MACRO_TYPES,
  TRIGGER_TYPES,
  GTM_PATTERNS,
  GTM_PROXY_INDICATORS,
  ERROR_MESSAGES
} from './constants.js';

export class ContainerAnalyzer {
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
      if ((now - entry.timestamp) > this.cacheTTL) {
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
    const entries = Array.from(this.analysisCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
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
      return { name: 'Custom Template', category: 'custom' };
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
    
    return { byCategory, byType };
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
    const sortedTags = Object.entries(tagData)
      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    
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
    const sortedMacros = Object.entries(macroData)
      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    
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
    const sortedTriggers = Object.entries(triggerData)
      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));
    
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
      macros: { byName: {}, total: 0 },
      predicates: [],
      tags: { byName: {}, total: 0, byCategory: {}, byType: {} },
      triggers: { byName: {}, total: 0 },
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
    return (Date.now() - cached.timestamp) < this.cacheTTL;
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
      
      return hasGTMPattern || 
             (urlObj.hostname.includes('googletagmanager.com') && hasProxyIndicator);
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