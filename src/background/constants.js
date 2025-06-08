/**
 * Configuration constants for GTM Size Extension
 */
export const CONFIG = {
  // GTM Configuration
  MAX_GTM_SIZE: 200 * 1024, // 200KB in bytes
  GTM_SIZE_LIMIT_PERCENT: 100, // 100% of MAX_GTM_SIZE

  // Cache Configuration
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_CACHE_ENTRIES: 50,

  // Cleanup Configuration
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute in milliseconds
  MAX_TAB_HISTORY: 10,

  // Request Configuration
  REQUEST_TIMEOUT: 15000, // 15 seconds
  MAX_CONCURRENT_REQUESTS: 3,

  // Memory Configuration
  MAX_MEMORY_USAGE: 10 * 1024 * 1024, // 10MB
  MEMORY_CHECK_INTERVAL: 2 * 60 * 1000, // 2 minutes
};

/**
 * Cache key prefixes
 */
export const CACHE_KEYS = {
  CONTAINERS: 'containers_',
  PERFORMANCE: 'performanceStats',
  MEMORY_HISTORY: 'memoryHistory'
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
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
export const GTM_PATTERNS = {
  OFFICIAL_GOOGLE: /https:\/\/www\.googletagmanager\.com\/gtm\.js/,
  GENERIC_GTM: /\/gtm\.js\?id=GTM-[A-Z0-9]+/,
  BROAD_GTM: /gtm\.js\?id=GTM-[A-Z0-9-]+/
};

/**
 * GTM URL patterns for proxy detection
 */
export const GTM_PROXY_INDICATORS = [
  '/gtm.js',
  '/gtag/js',
  '/gtm.'
];

/**
 * Mapping of GTM tag types to friendly names and categories
 * Used for tag identification and categorization in the UI
 */
export const KNOWN_TAGS = {
  // Google Tags
  'googtag': { name: 'Google Tag', category: 'google' },
  'ga': { name: 'Google Analytics (Legacy)', category: 'google' },
  'ua': { name: 'Universal Analytics', category: 'google' },
  'gaawe': { name: 'Google Analytics 4', category: 'google' },
  'awct': { name: 'Google Ads Conversion', category: 'google' },
  'sp': { name: 'Google Ads Remarketing', category: 'google' },
  'flc': { name: 'Floodlight Counter', category: 'google' },
  'fls': { name: 'Floodlight Sales', category: 'google' },
  'ts': { name: 'Google Trusted Stores', category: 'google' },
  'gcs': { name: 'Google Consumer Surveys', category: 'google' },
  'gclidw': { name: 'Google Ads Conversion Linker', category: 'google' },
  'gaawc': { name: 'Google Tag (GA4)', category: 'google' },

  // Custom Tags
  'html': { name: 'Custom HTML', category: 'custom' },
  'img': { name: 'Custom Image', category: 'custom' },

  // Analytics Tags
  'cegg': { name: 'Crazy Egg', category: 'analytics' },
  'mf': { name: 'Mouseflow', category: 'analytics' },
  'vdc': { name: 'VisualDNA', category: 'analytics' },
  'tdc': { name: 'Turn Data Collection', category: 'analytics' },
  'tc': { name: 'Turn Conversion', category: 'analytics' },
  'placedPixel': { name: 'Placed', category: 'analytics' },
  'ndcr': { name: 'Nielsen DCR', category: 'analytics' },
  'ljs': { name: 'Lytics JS', category: 'analytics' },
  'k50Init': { name: 'K50', category: 'analytics' },
  'infinity': { name: 'Infinity Call', category: 'analytics' },
  'hjtc': { name: 'Hotjar', category: 'analytics' },
  'fxm': { name: 'FoxMetrics', category: 'analytics' },
  'cts': { name: 'ClickTale', category: 'analytics' },
  'csm': { name: 'comScore', category: 'analytics' },
  'adm': { name: 'Adometry', category: 'analytics' },

  // Social Media Tags
  'pntr': { name: 'Pinterest', category: 'social' },
  'twitter_website_tag': { name: 'Twitter Website Tag', category: 'social' },
  'bzi': { name: 'LinkedIn Insight', category: 'social' },
  'okt': { name: 'Oktopost', category: 'social' },
  'shareaholic': { name: 'Shareaholic', category: 'social' },

  // Advertising Tags
  'fbq': { name: 'Facebook Pixel', category: 'advertising' },
  'crto': { name: 'Criteo', category: 'advertising' },
  'pa': { name: 'Perfect Audience', category: 'advertising' },
  'qcm': { name: 'Quantcast', category: 'advertising' },
  'qpx': { name: 'Quora Pixel', category: 'advertising' },
  'sfr': { name: 'SearchForce Redirect', category: 'advertising' },
  'sfl': { name: 'SearchForce Landing', category: 'advertising' },
  'sfc': { name: 'SearchForce Conversion', category: 'advertising' },
  'sca': { name: 'Intent Media', category: 'advertising' },
  'mpr': { name: 'Mediaplex ROI', category: 'advertising' },
  'mpm': { name: 'Mediaplex MCT', category: 'advertising' },
  'ms': { name: 'Marin Software', category: 'advertising' },
  'baut': { name: 'Bing Universal', category: 'advertising' },
  'asp': { name: 'AdRoll Smart Pixel', category: 'advertising' },
  'ta': { name: 'AdAdvisor/Neustar', category: 'advertising' },

  // Marketing Tags
  'scjs': { name: 'SaleCycle JS', category: 'marketing' },
  'scp': { name: 'SaleCycle Pixel', category: 'marketing' },
  'yieldify': { name: 'Yieldify', category: 'marketing' },
  'xpsh': { name: 'Xtremepush', category: 'marketing' },
  'vei': { name: 'Ve Interactive', category: 'marketing' },
  'veip': { name: 'Ve Pixel', category: 'marketing' },
  'uslt': { name: 'Upsellit Footer', category: 'marketing' },
  'uspt': { name: 'Upsellit Confirmation', category: 'marketing' },
  'll': { name: 'LeadLab', category: 'marketing' },

  // Affiliate Tags
  'tdsc': { name: 'Tradedoubler Sale', category: 'affiliate' },
  'tdlc': { name: 'Tradedoubler Lead', category: 'affiliate' },
  'awj': { name: 'Affiliate Window', category: 'affiliate' },
  'awc': { name: 'Affiliate Window Conv', category: 'affiliate' },

  // Feedback Tags
  'svw': { name: 'Survicate', category: 'feedback' },
  'bb': { name: 'Bizrate Buyer', category: 'feedback' },
  'bsa': { name: 'Bizrate Survey', category: 'feedback' },
  'nudge': { name: 'Nudge', category: 'feedback' },

  // Testing Tags
  'abtGeneric': { name: 'AB Tasty', category: 'testing' },

  // Chat Tags
  'messagemate': { name: 'Message Mate', category: 'chat' },

  // Content Tags
  'dstag': { name: 'DistroScale', category: 'content' },

  // Personalization Tags
  'pc': { name: 'Personali Canvas', category: 'personalization' },

  // Other Tags
  'zone': { name: 'Zonas', category: 'other' }
};

/**
 * Friendly names for tag categories used in UI display
 */
export const CATEGORY_NAMES = {
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
export const MACRO_TYPES = {
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
export const TRIGGER_TYPES = {
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