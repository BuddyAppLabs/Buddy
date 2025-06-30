/**
 * 插件系统配置
 */

export default {
  // 插件存储
  storage: {
    path: env('PLUGINS_PATH', './plugins'),
    max_size: parseInt(env('PLUGIN_MAX_SIZE', '10')), // MB
    allowed_extensions: ['.zip', '.tar.gz', '.plugin'],
  },

  // 插件市场
  market: {
    url: env('PLUGIN_MARKET_URL', 'https://market.buddy.app'),
    api_key: env('PLUGIN_MARKET_API_KEY'),
    check_updates: env('PLUGIN_CHECK_UPDATES', 'true') === 'true',
    auto_update: env('PLUGIN_AUTO_UPDATE', 'false') === 'true',
    update_interval: parseInt(env('PLUGIN_UPDATE_INTERVAL', '3600000')), // 1 hour
  },

  // 插件安全
  security: {
    verify_signature: env('PLUGIN_VERIFY_SIGNATURE', 'true') === 'true',
    sandbox: env('PLUGIN_SANDBOX', 'true') === 'true',
    allowed_domains: (env('PLUGIN_ALLOWED_DOMAINS') || '')
      .split(',')
      .filter(Boolean),
    blocked_apis: (env('PLUGIN_BLOCKED_APIS') || 'fs,child_process').split(','),
  },

  // 插件执行
  execution: {
    timeout: parseInt(env('PLUGIN_TIMEOUT', '5000')), // ms
    memory_limit: parseInt(env('PLUGIN_MEMORY_LIMIT', '64')), // MB
    concurrent_limit: parseInt(env('PLUGIN_CONCURRENT_LIMIT', '5')),
  },

  // 内置插件
  builtin: {
    calculator: {
      enabled: true,
      priority: 100,
    },
    file_search: {
      enabled: true,
      priority: 90,
      indexed_paths: (env('FILE_SEARCH_PATHS') || '')
        .split(',')
        .filter(Boolean),
    },
    app_launcher: {
      enabled: true,
      priority: 80,
      scan_paths: (env('APP_SCAN_PATHS') || '').split(',').filter(Boolean),
    },
  },
};

function env(key, defaultValue = null) {
  return process.env[key] ?? defaultValue;
}
