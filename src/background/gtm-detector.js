import {
  CONFIG,
  GTM_PATTERNS,
  GTM_PROXY_INDICATORS,
  ERROR_MESSAGES
} from './constants.js';

export class GTMDetector {
  constructor(cacheManager, onContainerDetected) {
    this.cacheManager = cacheManager;
    this.onContainerDetected = onContainerDetected;
    this.requestTiming = {};
    this.requestTimeout = CONFIG.REQUEST_TIMEOUT;
    this.maxGtmSize = CONFIG.MAX_GTM_SIZE;
    console.log('[GTMDetector] Initialized');
  }

  /**
   * Check if URL is a GTM proxy (non-Google domain serving GTM)
   */
  isGtmProxy(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes('googletagmanager.com') &&
        GTM_PROXY_INDICATORS.some(indicator => url.includes(indicator))
      );
    } catch (e) {
      console.error('[GTMDetector] URL inválida ao verificar proxy:', url, e);
      return false;
    }
  }

  /**
   * Check if URL is a GTM request using pattern matching
   */
  isGTMRequest(url) {
    if (!url || typeof url !== 'string') return false;
    return Object.values(GTM_PATTERNS).some(pattern => pattern.test(url));
  }

  /**
   * Extract GTM container ID from URL
   */
  extractContainerId(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id');
    } catch (e) {
      console.error('[GTMDetector] Erro ao extrair ID do container:', url, e);
      return null;
    }
  }

  /**
   * Validate if extracted container ID is valid GTM format
   */
  isValidContainerId(containerId) {
    if (!containerId || typeof containerId !== 'string') return false;
    const gtmPattern = /^GTM-[A-Z0-9]{7,}$/;
    return gtmPattern.test(containerId);
  }

  /**
   * Start timing for a GTM request
   */
  startRequestTiming(requestId, url, tabId) {
    if (!requestId || !url || typeof tabId !== 'number') {
      console.warn('[GTMDetector] Invalid parameters for startRequestTiming');
      return;
    }
    this.requestTiming[requestId] = {
      startTime: performance.now(),
      url: url,
      tabId: tabId
    };
    console.log(`[GTMDetector] Timing started for request ${requestId}`);
  }

  /**
   * Complete timing for a GTM request
   */
  completeRequestTiming(requestId) {
    if (!requestId || !this.requestTiming[requestId]) {
      return null;
    }
    const timing = this.requestTiming[requestId];
    timing.endTime = performance.now();
    timing.loadTime = Math.round(timing.endTime - timing.startTime) / 1000;
    console.log(`[GTMDetector] Request ${requestId} completed in ${timing.loadTime}s`);
    return timing;
  }

  /**
   * Clean up timing data for a request
   */
  cleanupRequestTiming(requestId) {
    if (requestId && this.requestTiming[requestId]) {
      delete this.requestTiming[requestId];
    }
  }

  /**
   * Clean up all timing data
   */
  cleanupAllTiming() {
    const count = Object.keys(this.requestTiming).length;
    this.requestTiming = {};
    if (count > 0) {
      console.log(`[GTMDetector] Cleaned up ${count} timing entries`);
    }
  }

  /**
   * Calculate container size percentage based on GTM limit
   */
  calculateSizePercentage(sizeInBytes = 0) {
    return Math.round((sizeInBytes / this.maxGtmSize) * 100);
  }

  /**
   * Measure GTM container size from response headers and content
   */
  async measureContainerSize(details) {
    let contentLengthInKb = 0;
    let uncompressedSizeKb = 0;
    let sizeEstimate = false;
    try {
      console.log('[GTMDetector] Measuring container size...');
      const contentLengthHeader = details.responseHeaders?.find(
        (header) => header.name.toLowerCase() === 'content-length'
      );
      if (contentLengthHeader?.value) {
        contentLengthInKb = Math.round(parseInt(contentLengthHeader.value) / 1024);
        console.log(`[GTMDetector] Content-Length: ${contentLengthInKb}KB`);
        const response = await fetch(details.url, {
          cache: 'no-store',
          credentials: 'same-origin'
        });
        const text = await response.text();
        uncompressedSizeKb = Math.round(new TextEncoder().encode(text).length / 1024);
        const contentEncoding = response.headers.get('content-encoding');
        const isCompressed = !!contentEncoding;
        if (isCompressed) {
          console.log(`[GTMDetector] Compressed (${contentEncoding}): ${contentLengthInKb}KB -> ${uncompressedSizeKb}KB`);
        } else {
          console.log(`[GTMDetector] Uncompressed: ${contentLengthInKb}KB`);
          uncompressedSizeKb = contentLengthInKb;
        }
      } else {
        console.log('[GTMDetector] No Content-Length header, fetching...');
        sizeEstimate = true;
        const response = await fetch(details.url, {
          cache: 'no-store',
          credentials: 'same-origin'
        });
        const buffer = await response.arrayBuffer();
        contentLengthInKb = Math.round(buffer.byteLength / 1024);
        const text = new TextDecoder().decode(buffer);
        uncompressedSizeKb = Math.round(new TextEncoder().encode(text).length / 1024);
        console.log(`[GTMDetector] Estimated size: ${contentLengthInKb}KB`);
      }
    } catch (error) {
      console.error('[GTMDetector] Error measuring container size:', error);
      const contentLengthHeader = details.responseHeaders?.find(
        (header) => header.name.toLowerCase() === 'content-length'
      );
      if (contentLengthHeader?.value) {
        contentLengthInKb = Math.round(parseInt(contentLengthHeader.value) / 1024);
        console.log('[GTMDetector] Using content-length fallback:', contentLengthInKb, 'KB');
      }
    }
    return {
      sizeInKb: contentLengthInKb,
      uncompressedSizeKb,
      sizeEstimate,
      sizeInBytes: contentLengthInKb * 1024,
      percentage: this.calculateSizePercentage(contentLengthInKb * 1024)
    };
  }

  /**
   * Set up Chrome webRequest listeners for GTM detection
   */
  setupWebRequestListeners() {
    console.log('[GTMDetector] Setting up web request listeners...');
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => this.handleBeforeRequest(details),
      { urls: ['<all_urls>'] }
    );
    chrome.webRequest.onCompleted.addListener(
      (details) => this.handleRequestCompleted(details),
      { urls: ['<all_urls>'] },
      ['responseHeaders']
    );
    console.log('[GTMDetector] Web request listeners configured');
  }

  /**
   * Handle onBeforeRequest event
   */
  handleBeforeRequest(details) {
    console.log(`[GTMDetector] Request detected: ${details.url}`, {
      type: details.type,
      tabId: details.tabId,
      frameId: details.frameId,
      requestId: details.requestId
    });
    if (details.type === 'script' && this.isGTMRequest(details.url)) {
      console.log(`[GTMDetector] GTM script detected: ${details.url} (tab: ${details.tabId})`);
      this.startRequestTiming(details.requestId, details.url, details.tabId);
    }
  }

  /**
   * Handle onCompleted event
   */
  async handleRequestCompleted(details) {
    console.log(`[GTMDetector] Request completed: ${details.url}`, {
      type: details.type,
      tabId: details.tabId,
      requestId: details.requestId,
      statusCode: details.statusCode
    });
    if (details.type !== 'script' || !this.isGTMRequest(details.url)) {
      return;
    }
    console.log('[GTMDetector] Processing GTM script completion...');
    try {
      const timing = this.completeRequestTiming(details.requestId);
      const containerId = this.extractContainerId(details.url);
      if (!containerId) {
        console.error('[GTMDetector] Invalid container ID extracted from:', details.url);
        return;
      }
      if (!this.isValidContainerId(containerId)) {
        console.error('[GTMDetector] Container ID format invalid:', containerId);
        return;
      }
      const sizeInfo = await this.measureContainerSize(details);
      const containerData = {
        sizeInKb: sizeInfo.sizeInKb,
        percent: sizeInfo.percentage,
        timing: timing || null,
        url: details.url,
        isProxy: !details.url.includes('googletagmanager.com'),
        sizeEstimate: sizeInfo.sizeEstimate,
        detectedAt: Date.now()
      };
      console.log(`[GTMDetector] Container ${containerId} processed:`, {
        size: `${sizeInfo.sizeInKb}KB`,
        percentage: `${sizeInfo.percentage}%`,
        loadTime: timing ? `${timing.loadTime}s` : 'unknown'
      });
      this.cacheManager.setContainer(details.tabId, containerId, containerData);
      if (this.onContainerDetected) {
        await this.onContainerDetected(details.tabId, containerId, containerData);
      }
      this.cleanupRequestTiming(details.requestId);
    } catch (error) {
      console.error('[GTMDetector] Error processing GTM container:', error);
      this.cleanupRequestTiming(details.requestId);
    }
  }

  /**
   * Get current detector statistics for debugging
   */
  getStats() {
    return {
      pendingRequests: Object.keys(this.requestTiming).length,
      requestTimeout: this.requestTimeout
    };
  }
}
