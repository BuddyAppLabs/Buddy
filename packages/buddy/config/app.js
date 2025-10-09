/**
 * Buddy 应用配置
 */

export default {
  // 应用基础信息
  name: env('APP_NAME', 'Buddy'),
  description: 'A spotlight-like productivity application',

  // 环境配置
  env: env('NODE_ENV', 'development'),
  debug: env('APP_DEBUG', 'true') === 'true',

  // 主窗口配置
  window: {
    width: parseInt(env('WINDOW_WIDTH', '800')),
    height: parseInt(env('WINDOW_HEIGHT', '600')),
    minWidth: 600,
    minHeight: 400,
    resizable: true,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webSecurity: false,

    // 窗口位置
    center: true,
    x: parseInt(env('WINDOW_X', '0')) || undefined,
    y: parseInt(env('WINDOW_Y', '0')) || undefined,

    // macOS 特定
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
  },

  // 热键配置
  hotkeys: {
    toggle: env('HOTKEY_TOGGLE', 'Command+Space'),
    quit: env('HOTKEY_QUIT', 'Command+Q'),
    hide: env('HOTKEY_HIDE', 'Escape'),
    reload: env('HOTKEY_RELOAD', 'Command+R'),
  },

  // 功能开关
  features: {
    ai_chat: env('ENABLE_AI', 'false') === 'true',
    plugin_system: env('ENABLE_PLUGINS', 'true') === 'true',
    auto_update: env('AUTO_UPDATE', 'true') === 'true',
    crash_reporting: env('CRASH_REPORTING', 'false') === 'true',
    analytics: env('ANALYTICS', 'false') === 'true',
    dev_tools: env('ENABLE_DEV_TOOLS', 'false') === 'true',
  },

  // 界面配置
  ui: {
    theme: env('UI_THEME', 'auto'), // auto, light, dark
    locale: env('UI_LOCALE', 'zh-CN'),
    animation: env('UI_ANIMATION', 'true') === 'true',
    sound: env('UI_SOUND', 'true') === 'true',

    // 搜索配置
    search: {
      max_results: parseInt(env('SEARCH_MAX_RESULTS', '50')),
      debounce: parseInt(env('SEARCH_DEBOUNCE', '200')),
      highlight: true,
      fuzzy: true,
    },
  },

  // 路径配置
  paths: {
    userData: env('USER_DATA_PATH'),
    plugins: env('PLUGINS_PATH', 'plugins'),
    logs: env('LOGS_PATH', 'logs'),
    cache: env('CACHE_PATH', 'cache'),
    temp: env('TEMP_PATH', 'temp'),
  },

  // 性能配置
  performance: {
    max_memory: parseInt(env('MAX_MEMORY', '512')), // MB
    gc_interval: parseInt(env('GC_INTERVAL', '60000')), // ms
    preload_plugins: env('PRELOAD_PLUGINS', 'true') === 'true',
  },

  // 更新配置
  updater: {
    autoCheck: true,
    autoCheckDelay: 5000, // 启动后5秒检查
    allowPrerelease: false,
  },
};

function env(key, defaultValue = null) {
  return process.env[key] ?? defaultValue;
}
