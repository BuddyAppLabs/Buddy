# Buddy 配置系统使用示例

## 项目集成示例

以下是在 Buddy 项目中集成和使用配置系统的完整示例。

## 1. 创建配置文件

### buddy/config/app.js

```javascript
/**
 * Buddy 应用配置
 */

export default {
    // 应用基础信息
    name: env('APP_NAME', 'Buddy'),
    version: '1.0.0',
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
        vibrancy: 'under-window'
    },
    
    // 热键配置
    hotkeys: {
        toggle: env('HOTKEY_TOGGLE', 'Command+Space'),
        quit: env('HOTKEY_QUIT', 'Command+Q'),
        hide: env('HOTKEY_HIDE', 'Escape'),
        reload: env('HOTKEY_RELOAD', 'Command+R')
    },
    
    // 功能开关
    features: {
        ai_chat: env('ENABLE_AI', 'false') === 'true',
        plugin_system: env('ENABLE_PLUGINS', 'true') === 'true',
        auto_update: env('AUTO_UPDATE', 'true') === 'true',
        crash_reporting: env('CRASH_REPORTING', 'false') === 'true',
        analytics: env('ANALYTICS', 'false') === 'true',
        dev_tools: env('ENABLE_DEV_TOOLS', 'false') === 'true'
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
            fuzzy: true
        }
    },
    
    // 路径配置
    paths: {
        userData: env('USER_DATA_PATH'),
        plugins: env('PLUGINS_PATH', 'plugins'),
        logs: env('LOGS_PATH', 'logs'),
        cache: env('CACHE_PATH', 'cache'),
        temp: env('TEMP_PATH', 'temp')
    },
    
    // 性能配置
    performance: {
        max_memory: parseInt(env('MAX_MEMORY', '512')), // MB
        gc_interval: parseInt(env('GC_INTERVAL', '60000')), // ms
        preload_plugins: env('PRELOAD_PLUGINS', 'true') === 'true'
    }
};

function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

### buddy/config/plugins.js

```javascript
/**
 * 插件系统配置
 */

export default {
    // 插件存储
    storage: {
        path: env('PLUGINS_PATH', './plugins'),
        max_size: parseInt(env('PLUGIN_MAX_SIZE', '10')), // MB
        allowed_extensions: ['.zip', '.tar.gz', '.plugin']
    },
    
    // 插件市场
    market: {
        url: env('PLUGIN_MARKET_URL', 'https://market.buddy.app'),
        api_key: env('PLUGIN_MARKET_API_KEY'),
        check_updates: env('PLUGIN_CHECK_UPDATES', 'true') === 'true',
        auto_update: env('PLUGIN_AUTO_UPDATE', 'false') === 'true',
        update_interval: parseInt(env('PLUGIN_UPDATE_INTERVAL', '3600000')) // 1 hour
    },
    
    // 插件安全
    security: {
        verify_signature: env('PLUGIN_VERIFY_SIGNATURE', 'true') === 'true',
        sandbox: env('PLUGIN_SANDBOX', 'true') === 'true',
        allowed_domains: (env('PLUGIN_ALLOWED_DOMAINS') || '').split(',').filter(Boolean),
        blocked_apis: (env('PLUGIN_BLOCKED_APIS') || 'fs,child_process').split(',')
    },
    
    // 插件执行
    execution: {
        timeout: parseInt(env('PLUGIN_TIMEOUT', '5000')), // ms
        memory_limit: parseInt(env('PLUGIN_MEMORY_LIMIT', '64')), // MB
        concurrent_limit: parseInt(env('PLUGIN_CONCURRENT_LIMIT', '5'))
    },
    
    // 内置插件
    builtin: {
        calculator: {
            enabled: true,
            priority: 100
        },
        file_search: {
            enabled: true,
            priority: 90,
            indexed_paths: (env('FILE_SEARCH_PATHS') || '').split(',').filter(Boolean)
        },
        app_launcher: {
            enabled: true,
            priority: 80,
            scan_paths: (env('APP_SCAN_PATHS') || '').split(',').filter(Boolean)
        }
    }
};

function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

### buddy/config/ai.js

```javascript
/**
 * AI 服务配置
 */

export default {
    // 是否启用 AI 功能
    enabled: env('AI_ENABLED', 'false') === 'true',
    
    // 默认 AI 提供商
    default_provider: env('AI_PROVIDER', 'openai'),
    
    // AI 提供商配置
    providers: {
        openai: {
            api_key: env('OPENAI_API_KEY'),
            base_url: env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
            model: env('OPENAI_MODEL', 'gpt-3.5-turbo'),
            max_tokens: parseInt(env('OPENAI_MAX_TOKENS', '1000')),
            temperature: parseFloat(env('OPENAI_TEMPERATURE', '0.7')),
            timeout: parseInt(env('OPENAI_TIMEOUT', '30000'))
        },
        
        claude: {
            api_key: env('CLAUDE_API_KEY'),
            base_url: env('CLAUDE_BASE_URL', 'https://api.anthropic.com'),
            model: env('CLAUDE_MODEL', 'claude-3-sonnet-20240229'),
            max_tokens: parseInt(env('CLAUDE_MAX_TOKENS', '1000')),
            timeout: parseInt(env('CLAUDE_TIMEOUT', '30000'))
        },
        
        local: {
            enabled: env('LOCAL_AI_ENABLED', 'false') === 'true',
            url: env('LOCAL_AI_URL', 'http://localhost:11434'),
            model: env('LOCAL_AI_MODEL', 'llama2'),
            timeout: parseInt(env('LOCAL_AI_TIMEOUT', '60000'))
        }
    },
    
    // 聊天配置
    chat: {
        max_history: parseInt(env('AI_CHAT_MAX_HISTORY', '50')),
        max_context_length: parseInt(env('AI_CHAT_MAX_CONTEXT', '4000')),
        system_prompt: env('AI_SYSTEM_PROMPT', 'You are a helpful assistant for Buddy, a productivity application.'),
        save_history: env('AI_SAVE_HISTORY', 'true') === 'true',
        auto_clear: env('AI_AUTO_CLEAR', 'false') === 'true',
        clear_interval: parseInt(env('AI_CLEAR_INTERVAL', '86400000')) // 24 hours
    },
    
    // 功能配置
    features: {
        text_completion: env('AI_TEXT_COMPLETION', 'true') === 'true',
        code_assistance: env('AI_CODE_ASSISTANCE', 'true') === 'true',
        translation: env('AI_TRANSLATION', 'true') === 'true',
        summarization: env('AI_SUMMARIZATION', 'true') === 'true',
        q_and_a: env('AI_Q_AND_A', 'true') === 'true'
    },
    
    // 安全配置
    security: {
        content_filter: env('AI_CONTENT_FILTER', 'true') === 'true',
        rate_limit: {
            requests_per_minute: parseInt(env('AI_RATE_LIMIT_RPM', '10')),
            requests_per_hour: parseInt(env('AI_RATE_LIMIT_RPH', '100'))
        },
        privacy: {
            log_conversations: env('AI_LOG_CONVERSATIONS', 'false') === 'true',
            anonymize_data: env('AI_ANONYMIZE_DATA', 'true') === 'true'
        }
    }
};

function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

## 2. 环境变量文件 (buddy/.env)

```bash
# 应用配置
APP_NAME=Buddy
NODE_ENV=development
APP_DEBUG=true

# 窗口配置
WINDOW_WIDTH=800
WINDOW_HEIGHT=600
WINDOW_X=
WINDOW_Y=

# 热键配置
HOTKEY_TOGGLE=Command+Space
HOTKEY_QUIT=Command+Q
HOTKEY_HIDE=Escape

# 功能开关
ENABLE_AI=false
ENABLE_PLUGINS=true
AUTO_UPDATE=true
CRASH_REPORTING=false
ANALYTICS=false
ENABLE_DEV_TOOLS=false

# 界面配置
UI_THEME=auto
UI_LOCALE=zh-CN
UI_ANIMATION=true
UI_SOUND=true
SEARCH_MAX_RESULTS=50
SEARCH_DEBOUNCE=200

# 路径配置
USER_DATA_PATH=
PLUGINS_PATH=plugins
LOGS_PATH=logs
CACHE_PATH=cache

# 性能配置
MAX_MEMORY=512
GC_INTERVAL=60000
PRELOAD_PLUGINS=true

# 插件配置
PLUGIN_MAX_SIZE=10
PLUGIN_MARKET_URL=https://market.buddy.app
PLUGIN_CHECK_UPDATES=true
PLUGIN_AUTO_UPDATE=false
PLUGIN_VERIFY_SIGNATURE=true
PLUGIN_SANDBOX=true
PLUGIN_TIMEOUT=5000
PLUGIN_MEMORY_LIMIT=64
PLUGIN_CONCURRENT_LIMIT=5

# AI 配置
AI_ENABLED=false
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
AI_CHAT_MAX_HISTORY=50
AI_SAVE_HISTORY=true
```

## 3. 应用初始化 (buddy/src/main/bootstrap/app.ts)

```typescript
/**
 * Buddy 应用启动配置
 */

import { app } from 'electron';
import { Application } from '@coffic/cosy-framework';
import { 
    ConfigServiceProvider,
    AppServiceProvider,
    Config,
    config
} from '@buddy/foundation';

// 创建应用实例
const application = new Application();

// 注册服务提供者
application.register([
    ConfigServiceProvider, // 配置服务必须最先注册
    AppServiceProvider,
    // ... 其他服务提供者
]);

// 应用初始化
export async function bootstrap(): Promise<Application> {
    try {
        // 启动服务提供者
        await application.boot();
        
        // 验证关键配置
        validateCriticalConfig();
        
        // 配置 Electron 应用
        configureElectronApp();
        
        console.log('✅ 应用启动完成');
        return application;
        
    } catch (error) {
        console.error('❌ 应用启动失败:', error);
        throw error;
    }
}

/**
 * 验证关键配置
 */
function validateCriticalConfig(): void {
    const requiredConfigs = [
        'app.name',
        'app.window.width',
        'app.window.height',
        'app.hotkeys.toggle'
    ];
    
    for (const configKey of requiredConfigs) {
        if (!Config.has(configKey)) {
            throw new Error(`关键配置缺失: ${configKey}`);
        }
    }
    
    console.log('✅ 配置验证通过');
}

/**
 * 配置 Electron 应用
 */
function configureElectronApp(): void {
    // 设置应用名称
    app.setName(config('app.name'));
    
    // 配置应用行为
    if (config('app.features.crash_reporting')) {
        // 启用崩溃报告
        app.enableSandbox();
    }
    
    // 配置热键 (如果在主进程)
    setupGlobalHotkeys();
    
    console.log('✅ Electron 应用配置完成');
}

/**
 * 设置全局热键
 */
function setupGlobalHotkeys(): void {
    const { globalShortcut } = require('electron');
    
    // 切换应用快捷键
    const toggleKey = config('app.hotkeys.toggle');
    if (toggleKey) {
        globalShortcut.register(toggleKey, () => {
            // 切换应用显示/隐藏
            application.make('window.manager').toggle();
        });
    }
    
    // 退出应用快捷键
    const quitKey = config('app.hotkeys.quit');
    if (quitKey) {
        globalShortcut.register(quitKey, () => {
            app.quit();
        });
    }
}

export { application };
```

## 4. 窗口管理器中使用配置 (buddy/src/main/window/WindowManager.ts)

```typescript
/**
 * 窗口管理器
 */

import { BrowserWindow, screen } from 'electron';
import { Config } from '@buddy/foundation';

export class WindowManager {
    private mainWindow: BrowserWindow | null = null;
    
    /**
     * 创建主窗口
     */
    public createMainWindow(): BrowserWindow {
        // 从配置获取窗口选项
        const windowOptions = this.getWindowOptions();
        
        // 创建窗口
        this.mainWindow = new BrowserWindow(windowOptions);
        
        // 配置窗口事件
        this.setupWindowEvents();
        
        // 加载页面
        this.loadPage();
        
        return this.mainWindow;
    }
    
    /**
     * 获取窗口配置选项
     */
    private getWindowOptions(): Electron.BrowserWindowConstructorOptions {
        const windowConfig = Config.getConfig('app.window');
        
        return {
            width: windowConfig.width,
            height: windowConfig.height,
            minWidth: windowConfig.minWidth,
            minHeight: windowConfig.minHeight,
            resizable: windowConfig.resizable,
            frame: windowConfig.frame,
            transparent: windowConfig.transparent,
            alwaysOnTop: windowConfig.alwaysOnTop,
            skipTaskbar: windowConfig.skipTaskbar,
            center: windowConfig.center,
            x: windowConfig.x,
            y: windowConfig.y,
            
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: windowConfig.webSecurity,
                devTools: Config.get('app.features.dev_tools')
            },
            
            // macOS 特定配置
            ...(process.platform === 'darwin' && {
                titleBarStyle: windowConfig.titleBarStyle,
                vibrancy: windowConfig.vibrancy
            })
        };
    }
    
    /**
     * 设置窗口事件监听
     */
    private setupWindowEvents(): void {
        if (!this.mainWindow) return;
        
        // 监听配置变化，动态更新窗口
        const unwatchWindow = Config.watch('app.window', (newConfig) => {
            this.updateWindowConfig(newConfig);
        });
        
        // 窗口关闭时清理
        this.mainWindow.on('closed', () => {
            unwatchWindow();
            this.mainWindow = null;
        });
        
        // 隐藏快捷键
        this.mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.key === Config.get('app.hotkeys.hide')) {
                this.hide();
            }
        });
    }
    
    /**
     * 更新窗口配置
     */
    private updateWindowConfig(config: any): void {
        if (!this.mainWindow) return;
        
        // 更新窗口大小
        this.mainWindow.setSize(config.width, config.height);
        
        // 更新置顶状态
        this.mainWindow.setAlwaysOnTop(config.alwaysOnTop);
        
        // 更新可调整大小状态
        this.mainWindow.setResizable(config.resizable);
        
        console.log('🪟 窗口配置已更新');
    }
    
    /**
     * 切换窗口显示状态
     */
    public toggle(): void {
        if (!this.mainWindow) {
            this.createMainWindow();
            return;
        }
        
        if (this.mainWindow.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * 显示窗口
     */
    public show(): void {
        if (!this.mainWindow) return;
        
        this.mainWindow.show();
        this.mainWindow.focus();
        
        // 如果配置了居中显示
        if (Config.get('app.window.center')) {
            this.centerWindow();
        }
    }
    
    /**
     * 隐藏窗口
     */
    public hide(): void {
        if (!this.mainWindow) return;
        
        this.mainWindow.hide();
    }
    
    /**
     * 居中显示窗口
     */
    private centerWindow(): void {
        if (!this.mainWindow) return;
        
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const windowBounds = this.mainWindow.getBounds();
        
        const x = Math.round((width - windowBounds.width) / 2);
        const y = Math.round((height - windowBounds.height) / 2);
        
        this.mainWindow.setPosition(x, y);
    }
    
    /**
     * 加载页面
     */
    private loadPage(): void {
        if (!this.mainWindow) return;
        
        const isDevelopment = Config.get('app.env') === 'development';
        
        if (isDevelopment) {
            this.mainWindow.loadURL('http://localhost:5173');
            
            // 开发模式下打开开发者工具
            if (Config.get('app.features.dev_tools')) {
                this.mainWindow.webContents.openDevTools();
            }
        } else {
            this.mainWindow.loadFile('./dist/index.html');
        }
    }
}
```

## 5. 渲染进程中使用配置

### buddy/src/renderer/src/composables/useConfig.ts

```typescript
/**
 * Vue 组合式函数：配置管理
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ipcRenderer } from 'electron';

export function useConfig() {
    const config = ref<Record<string, any>>({});
    const loading = ref(true);
    const error = ref<string | null>(null);
    
    /**
     * 获取配置值
     */
    const get = <T = any>(key: string, defaultValue?: T): T => {
        const keys = key.split('.');
        let current: any = config.value;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return defaultValue as T;
            }
        }
        
        return current !== undefined ? current : defaultValue as T;
    };
    
    /**
     * 设置配置值
     */
    const set = async (key: string, value: any): Promise<void> => {
        try {
            await ipcRenderer.invoke('config:set', key, value);
            
            // 更新本地配置
            const keys = key.split('.');
            let current = config.value;
            
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!current[k] || typeof current[k] !== 'object') {
                    current[k] = {};
                }
                current = current[k];
            }
            
            current[keys[keys.length - 1]] = value;
        } catch (err) {
            console.error('设置配置失败:', err);
            throw err;
        }
    };
    
    /**
     * 检查配置是否存在
     */
    const has = (key: string): boolean => {
        return get(key) !== undefined;
    };
    
    /**
     * 获取应用配置
     */
    const appConfig = computed(() => get('app', {}));
    
    /**
     * 获取窗口配置
     */
    const windowConfig = computed(() => get('app.window', {}));
    
    /**
     * 获取 UI 配置
     */
    const uiConfig = computed(() => get('app.ui', {}));
    
    /**
     * 获取功能开关
     */
    const features = computed(() => get('app.features', {}));
    
    /**
     * 加载配置
     */
    const loadConfig = async (): Promise<void> => {
        try {
            loading.value = true;
            error.value = null;
            
            const result = await ipcRenderer.invoke('config:all');
            config.value = result;
        } catch (err) {
            error.value = err instanceof Error ? err.message : '加载配置失败';
            console.error('加载配置失败:', err);
        } finally {
            loading.value = false;
        }
    };
    
    /**
     * 重新加载配置
     */
    const reload = async (): Promise<void> => {
        await ipcRenderer.invoke('config:reload');
        await loadConfig();
    };
    
    // 监听配置变化
    let configChangeListener: (event: any, key: string, newValue: any) => void;
    
    onMounted(async () => {
        await loadConfig();
        
        // 监听配置变化
        configChangeListener = (event, key, newValue) => {
            console.log(`配置变化: ${key} =`, newValue);
            
            // 更新本地配置
            const keys = key.split('.');
            let current = config.value;
            
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!current[k] || typeof current[k] !== 'object') {
                    current[k] = {};
                }
                current = current[k];
            }
            
            current[keys[keys.length - 1]] = newValue;
        };
        
        ipcRenderer.on('config:changed', configChangeListener);
    });
    
    onUnmounted(() => {
        if (configChangeListener) {
            ipcRenderer.off('config:changed', configChangeListener);
        }
    });
    
    return {
        config: readonly(config),
        loading: readonly(loading),
        error: readonly(error),
        
        // 方法
        get,
        set,
        has,
        reload,
        
        // 计算属性
        appConfig,
        windowConfig,
        uiConfig,
        features
    };
}
```

### buddy/src/renderer/src/components/SettingsPanel.vue

```vue
<script setup lang="ts">
/**
 * 设置面板组件
 */

import { ref, computed } from 'vue';
import { useConfig } from '@/composables/useConfig';

const { get, set, features, uiConfig, windowConfig } = useConfig();

// 界面设置
const theme = ref(get('app.ui.theme', 'auto'));
const locale = ref(get('app.ui.locale', 'zh-CN'));
const animation = ref(get('app.ui.animation', true));
const sound = ref(get('app.ui.sound', true));

// 功能开关
const aiEnabled = ref(get('app.features.ai_chat', false));
const pluginsEnabled = ref(get('app.features.plugin_system', true));
const autoUpdate = ref(get('app.features.auto_update', true));

// 窗口设置
const windowWidth = ref(get('app.window.width', 800));
const windowHeight = ref(get('app.window.height', 600));
const alwaysOnTop = ref(get('app.window.alwaysOnTop', true));

// 保存设置
const saveSettings = async () => {
    try {
        await Promise.all([
            // UI 设置
            set('app.ui.theme', theme.value),
            set('app.ui.locale', locale.value),
            set('app.ui.animation', animation.value),
            set('app.ui.sound', sound.value),
            
            // 功能开关
            set('app.features.ai_chat', aiEnabled.value),
            set('app.features.plugin_system', pluginsEnabled.value),
            set('app.features.auto_update', autoUpdate.value),
            
            // 窗口设置
            set('app.window.width', windowWidth.value),
            set('app.window.height', windowHeight.value),
            set('app.window.alwaysOnTop', alwaysOnTop.value)
        ]);
        
        console.log('✅ 设置已保存');
    } catch (error) {
        console.error('❌ 保存设置失败:', error);
    }
};

// 重置设置
const resetSettings = async () => {
    theme.value = 'auto';
    locale.value = 'zh-CN';
    animation.value = true;
    sound.value = true;
    aiEnabled.value = false;
    pluginsEnabled.value = true;
    autoUpdate.value = true;
    windowWidth.value = 800;
    windowHeight.value = 600;
    alwaysOnTop.value = true;
    
    await saveSettings();
};
</script>

<template>
    <div class="settings-panel p-6 space-y-6">
        <h2 class="text-2xl font-bold">设置</h2>
        
        <!-- 界面设置 -->
        <div class="setting-group">
            <h3 class="text-lg font-semibold mb-4">界面设置</h3>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">主题</span>
                    </label>
                    <select v-model="theme" class="select select-bordered">
                        <option value="auto">自动</option>
                        <option value="light">浅色</option>
                        <option value="dark">深色</option>
                    </select>
                </div>
                
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">语言</span>
                    </label>
                    <select v-model="locale" class="select select-bordered">
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                    </select>
                </div>
            </div>
            
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">启用动画效果</span>
                    <input v-model="animation" type="checkbox" class="toggle" />
                </label>
            </div>
            
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">启用音效</span>
                    <input v-model="sound" type="checkbox" class="toggle" />
                </label>
            </div>
        </div>
        
        <!-- 功能开关 -->
        <div class="setting-group">
            <h3 class="text-lg font-semibold mb-4">功能开关</h3>
            
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">启用 AI 聊天</span>
                    <input v-model="aiEnabled" type="checkbox" class="toggle" />
                </label>
            </div>
            
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">启用插件系统</span>
                    <input v-model="pluginsEnabled" type="checkbox" class="toggle" />
                </label>
            </div>
            
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">自动更新</span>
                    <input v-model="autoUpdate" type="checkbox" class="toggle" />
                </label>
            </div>
        </div>
        
        <!-- 窗口设置 -->
        <div class="setting-group">
            <h3 class="text-lg font-semibold mb-4">窗口设置</h3>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">宽度</span>
                    </label>
                    <input 
                        v-model.number="windowWidth" 
                        type="number" 
                        class="input input-bordered" 
                        min="600" 
                        max="2000"
                    />
                </div>
                
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">高度</span>
                    </label>
                    <input 
                        v-model.number="windowHeight" 
                        type="number" 
                        class="input input-bordered" 
                        min="400" 
                        max="1500"
                    />
                </div>
            </div>
            
            <div class="form-control">
                <label class="cursor-pointer label">
                    <span class="label-text">总是置顶</span>
                    <input v-model="alwaysOnTop" type="checkbox" class="toggle" />
                </label>
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex gap-4">
            <button @click="saveSettings" class="btn btn-primary">
                保存设置
            </button>
            <button @click="resetSettings" class="btn btn-outline">
                重置设置
            </button>
        </div>
    </div>
</template>
```

## 6. 配置路由 (buddy/src/main/routes/config.ts)

```typescript
/**
 * 配置相关路由
 */

import { Route } from '@buddy/foundation';
import { Config } from '@buddy/foundation';

// 获取所有配置
Route.handle('config:all')
    .description('获取所有配置')
    .middleware('logging')
    .execute(async (_event) => {
        return Config.all();
    });

// 获取指定配置
Route.handle('config:get')
    .description('获取指定配置')
    .validation({
        key: { type: 'string', required: true }
    })
    .execute(async (_event, params) => {
        const { key, defaultValue } = params;
        return Config.get(key, defaultValue);
    });

// 设置配置
Route.handle('config:set')
    .description('设置配置值')
    .validation({
        key: { type: 'string', required: true },
        value: { required: true }
    })
    .execute(async (event, params) => {
        const { key, value } = params;
        
        const oldValue = Config.get(key);
        Config.set(key, value);
        
        // 通知渲染进程配置已变化
        event.sender.send('config:changed', key, value);
        
        return { success: true, oldValue, newValue: value };
    });

// 检查配置是否存在
Route.handle('config:has')
    .description('检查配置是否存在')
    .validation({
        key: { type: 'string', required: true }
    })
    .execute(async (_event, params) => {
        const { key } = params;
        return Config.has(key);
    });

// 合并配置
Route.handle('config:merge')
    .description('合并配置对象')
    .validation({
        config: { type: 'object', required: true }
    })
    .execute(async (event, params) => {
        const { config } = params;
        
        Config.merge(config);
        
        // 通知渲染进程配置已变化
        event.sender.send('config:merged', config);
        
        return { success: true };
    });

// 删除配置
Route.handle('config:forget')
    .description('删除配置项')
    .validation({
        key: { type: 'string', required: true }
    })
    .execute(async (event, params) => {
        const { key } = params;
        
        const oldValue = Config.get(key);
        Config.forget(key);
        
        // 通知渲染进程配置已删除
        event.sender.send('config:forgotten', key, oldValue);
        
        return { success: true, oldValue };
    });

// 重新加载配置
Route.handle('config:reload')
    .description('重新加载配置')
    .execute(async (event) => {
        await Config.reload();
        
        // 通知渲染进程配置已重新加载
        event.sender.send('config:reloaded', Config.all());
        
        return { success: true };
    });

// 获取配置状态
Route.handle('config:status')
    .description('获取配置系统状态')
    .execute(async (_event) => {
        return Config.getStatus();
    });
```

## 总结

这个完整的示例展示了如何在 Buddy 项目中集成和使用新的配置系统：

1. **配置文件**: 创建了应用、插件、AI 等模块的配置文件
2. **环境变量**: 使用 `.env` 文件管理环境相关配置
3. **应用初始化**: 在应用启动时初始化配置系统
4. **主进程使用**: 在窗口管理器等主进程模块中使用配置
5. **渲染进程使用**: 创建 Vue 组合式函数和组件来管理配置
6. **IPC 路由**: 提供配置相关的 IPC 通信接口

通过这个配置系统，Buddy 应用可以实现：
- **配置文件管理**: 结构化的配置文件组织
- **环境变量支持**: 不同环境的配置切换
- **实时配置更新**: 配置变化时的实时响应
- **类型安全**: TypeScript 的完整类型支持
- **Laravel 风格**: 熟悉的 API 设计模式 