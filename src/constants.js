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
  CACHE_ERROR: 'Erro ao acessar cache'
};

// TODO: Add other constants below as needed for future refactors
