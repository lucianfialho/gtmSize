// src/background/cache-manager.js

import { CONFIG, CACHE_KEYS, ERROR_MESSAGES } from './constants.js';

export class CacheManager {
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
      await chrome.storage.local.set({ [cacheKey]: cacheData });
      
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
      const isExpired = (Date.now() - cachedData.timestamp) > this.cacheTTL;
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
      
      await chrome.storage.local.set({ [cacheKey]: memoryHistory });
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
          if ((now - value.timestamp) > this.cacheTTL) {
            keysToRemove.push(key);
          }
        }
        
        // Check performance stats (keep for 24 hours)
        if (key === CACHE_KEYS.PERFORMANCE && value.timestamp) {
          const performanceTTL = 24 * 60 * 60 * 1000; // 24 hours
          if ((now - value.timestamp) > performanceTTL) {
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
    const totalContainers = Object.values(this.containersByTab)
      .reduce((total, containers) => total + Object.keys(containers).length, 0);
    
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