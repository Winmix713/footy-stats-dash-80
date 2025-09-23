
// API Configuration
export const API_CONFIG = {
  // GitHub raw data configuration (primary source)
  GITHUB_BASE_URL: 'https://raw.githubusercontent.com/Winmix713/alapmanr/refs/heads/main',
  GITHUB_MATCHES_ENDPOINT: '/combined_matches.json',
  
  // PHP API configuration (secondary source)
  PHP_BASE_URL: import.meta.env.VITE_PHP_API_BASE_URL || 'https://your-php-api.com',
  PHP_MATCHES_ENDPOINT: '/fullapi.php',
  
  // Winmix API configuration (fallback)
  WINMIX_BASE_URL: 'https://www.winmix.hu/api/2',
  WINMIX_MATCHES_ENDPOINT: '/combined_matches.json',
  
  // Fallback configuration for mock data
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000'),
  
  // Logging configuration
  enableLogging: import.meta.env.MODE === 'development' || import.meta.env.VITE_ENABLE_LOGGING === 'true',
  
  // Data source priority
  dataSources: ['github', 'php', 'winmix', 'mock'] as const
};

export const API_ENDPOINTS = {
  // GitHub endpoints
  GITHUB_MATCHES: `${API_CONFIG.GITHUB_BASE_URL}${API_CONFIG.GITHUB_MATCHES_ENDPOINT}`,
  
  // PHP endpoints
  PHP_MATCHES: `${API_CONFIG.PHP_BASE_URL}${API_CONFIG.PHP_MATCHES_ENDPOINT}`,
  
  // Winmix endpoints
  WINMIX_MATCHES: `${API_CONFIG.WINMIX_BASE_URL}${API_CONFIG.WINMIX_MATCHES_ENDPOINT}`,
  
  // Legacy endpoints
  FOOTBALL_DATA: '/football.php',
  HEALTH_CHECK: '/health'
} as const;

export const getApiConfig = () => API_CONFIG;
