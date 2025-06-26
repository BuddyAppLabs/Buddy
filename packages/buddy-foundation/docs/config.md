# Buddy Foundation 配置系统

## 概述

Buddy Foundation 配置系统基于 Laravel 的配置系统设计理念，提供了一个强大、灵活且易于使用的配置管理解决方案。它支持多种配置文件格式、环境变量集成、配置缓存、点记法访问和配置观察等高级功能。

## 核心特性

### 🔧 Laravel 风格的设计

- **点记法访问**: 使用 `config('app.name')` 的方式访问嵌套配置
- **门面模式**: 提供 `Config` 门面，实现静态方法调用
- **服务提供者**: 集成到 Cosy 框架的服务容器中
- **环境变量集成**: 完整支持 `.env` 文件和环境变量

### 📁 多种配置文件格式

- **JavaScript/TypeScript**: `.js`, `.mjs`, `.ts`
- **JSON**: `.json`
- **动态配置**: 支持函数返回值和异步配置

### ⚡ 性能优化

- **配置缓存**: 生产环境自动启用配置缓存
- **延迟加载**: 配置文件按需加载
- **内存优化**: 智能的配置存储和访问机制

### 🔍 高级功能

- **配置观察**: 实时监听配置变化
- **配置分组**: 支持配置命名空间
- **配置验证**: 内置配置值验证机制
- **热重载**: 开发环境支持配置热重载

## 快速开始

### 基本安装

在 Buddy 项目中，配置系统已经集成到 foundation 包中：

```typescript
import { Config, config, configManager } from '@buddy/foundation';
```

### 目录结构

```
config/
├── app.js          # 应用配置
├── database.js     # 数据库配置
├── cache.js        # 缓存配置
├── logging.js      # 日志配置
└── custom.json     # 自定义配置
```

### 基本使用

#### 1. 配置文件创建

**config/app.js**

```javascript
export default {
    name: process.env.APP_NAME || 'Buddy',
    version: '1.0.0',
    debug: process.env.NODE_ENV !== 'production',
    url: process.env.APP_URL || 'http://localhost:3000',
    
    // 嵌套配置
    window: {
        width: 1200,
        height: 800,
        resizable: true
    },
    
    // 动态配置
    timestamp: () => Date.now(),
    
    // 环境相关配置
    features: {
        ai_chat: process.env.ENABLE_AI === 'true',
        plugin_market: true,
        auto_update: process.env.NODE_ENV === 'production'
    }
};
```

**config/database.js**

```javascript
export default {
    default: 'sqlite',
    
    connections: {
        sqlite: {
            driver: 'sqlite3',
            database: process.env.DB_PATH || './data/app.db',
            foreign_keys: true
        },
        
        mysql: {
            driver: 'mysql2',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            database: process.env.DB_NAME || 'buddy',
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || ''
        }
    }
};
```

#### 2. 初始化配置系统

```typescript
import { configManager } from '@buddy/foundation';

async function initializeApp() {
    await configManager.initialize({
        configPath: './config',
        envPath: './.env',
        cache: {
            enabled: process.env.NODE_ENV === 'production',
            path: './bootstrap/cache/config.json'
        }
    });
}
```

#### 3. 访问配置

```typescript
import { Config, config } from '@buddy/foundation';

// 使用门面访问
const appName = Config.get('app.name');
const windowWidth = Config.get('app.window.width', 1000);

// 使用助手函数访问
const dbConnection = config('database.default');
const features = config('app.features');

// 获取所有配置
const allConfig = config();

// 检查配置是否存在
if (Config.has('app.debug')) {
    console.log('Debug mode:', Config.get('app.debug'));
}
```

## API 参考

### Config 门面

#### 静态方法

```typescript
// 获取配置值
Config.get<T>(key: string, defaultValue?: T): T

// 设置配置值
Config.set(key: string, value: ConfigValue): void

// 检查配置是否存在
Config.has(key: string): boolean

// 获取所有配置
Config.all(): ConfigObject

// 合并配置
Config.merge(config: ConfigObject): void

// 删除配置项
Config.forget(key: string): void

// 获取配置分支
Config.getConfig(prefix: string): ConfigObject

// 观察配置变化
Config.watch(key: string, callback: Function): () => void

// 重新加载配置
Config.reload(): Promise<void>

// 缓存配置
Config.cache(): Promise<void>

// 清除缓存
Config.clearCache(): Promise<void>

// 获取系统状态
Config.getStatus(): object
```

### 配置管理器

```typescript
import { configManager } from '@buddy/foundation';

// 初始化
await configManager.initialize(options);

// 重新加载
await configManager.reload();

// 获取状态
const status = configManager.getStatus();

// 销毁
configManager.destroy();
```

### 助手函数

```typescript
import { config, env } from '@buddy/foundation';

// 配置助手
const value = config('key.path', 'default');
const allConfig = config();

// 环境变量助手
const dbUrl = env('DATABASE_URL', 'sqlite://./app.db');
const isProduction = env('NODE_ENV') === 'production';
```

## 配置文件示例

### 应用配置 (config/app.js)

```javascript
export default {
    // 基本应用信息
    name: env('APP_NAME', 'Buddy'),
    version: '1.0.0',
    description: 'Spotlight-like application for productivity',
    
    // 环境配置
    env: env('NODE_ENV', 'development'),
    debug: env('APP_DEBUG', 'true') === 'true',
    url: env('APP_URL', 'http://localhost:3000'),
    
    // 窗口配置
    window: {
        width: parseInt(env('WINDOW_WIDTH', '1200')),
        height: parseInt(env('WINDOW_HEIGHT', '800')),
        resizable: true,
        frame: false,
        transparent: true,
        alwaysOnTop: false,
        webSecurity: false
    },
    
    // 热键配置
    hotkeys: {
        toggle: env('HOTKEY_TOGGLE', 'Command+Space'),
        quit: 'Command+Q',
        hide: 'Escape'
    },
    
    // 功能开关
    features: {
        ai_chat: env('ENABLE_AI', 'false') === 'true',
        plugin_system: true,
        auto_update: env('AUTO_UPDATE', 'true') === 'true',
        crash_reporting: env('CRASH_REPORTING', 'false') === 'true'
    },
    
    // 路径配置
    paths: {
        userData: env('USER_DATA_PATH'),
        plugins: env('PLUGINS_PATH', './plugins'),
        logs: env('LOGS_PATH', './logs'),
        cache: env('CACHE_PATH', './cache')
    }
};

// 环境变量助手函数
function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

### 数据库配置 (config/database.js)

```javascript
export default {
    // 默认连接
    default: env('DB_CONNECTION', 'sqlite'),
    
    // 数据库连接配置
    connections: {
        sqlite: {
            driver: 'better-sqlite3',
            database: env('DB_DATABASE', './data/buddy.db'),
            foreign_keys: true,
            journal_mode: 'WAL',
            synchronous: 'NORMAL',
            cache_size: -16384, // 16MB
            temp_store: 'MEMORY'
        },
        
        mysql: {
            driver: 'mysql2',
            host: env('DB_HOST', 'localhost'),
            port: parseInt(env('DB_PORT', '3306')),
            database: env('DB_DATABASE', 'buddy'),
            username: env('DB_USERNAME', 'root'),
            password: env('DB_PASSWORD', ''),
            charset: 'utf8mb4',
            timezone: '+00:00',
            pool: {
                min: 2,
                max: 10,
                acquireTimeoutMillis: 30000,
                createTimeoutMillis: 30000,
                destroyTimeoutMillis: 5000,
                idleTimeoutMillis: 30000,
                reapIntervalMillis: 1000,
                createRetryIntervalMillis: 100
            }
        },
        
        postgresql: {
            driver: 'pg',
            host: env('DB_HOST', 'localhost'),
            port: parseInt(env('DB_PORT', '5432')),
            database: env('DB_DATABASE', 'buddy'),
            username: env('DB_USERNAME', 'postgres'),
            password: env('DB_PASSWORD', ''),
            ssl: env('DB_SSL', 'false') === 'true'
        }
    },
    
    // 迁移配置
    migrations: {
        directory: './database/migrations',
        tableName: 'migrations',
        extension: 'ts'
    },
    
    // 种子配置
    seeds: {
        directory: './database/seeds'
    }
};

function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

### 缓存配置 (config/cache.js)

```javascript
export default {
    // 默认缓存驱动
    default: env('CACHE_DRIVER', 'file'),
    
    // 缓存存储配置
    stores: {
        file: {
            driver: 'file',
            path: env('CACHE_FILE_PATH', './storage/cache'),
            prefix: 'buddy_cache',
            ttl: 3600 // 1 hour
        },
        
        memory: {
            driver: 'memory',
            max: 1000, // 最大条目数
            ttl: 1800  // 30 minutes
        },
        
        redis: {
            driver: 'redis',
            host: env('REDIS_HOST', 'localhost'),
            port: parseInt(env('REDIS_PORT', '6379')),
            password: env('REDIS_PASSWORD'),
            database: parseInt(env('REDIS_DB', '0')),
            prefix: env('REDIS_PREFIX', 'buddy_cache:'),
            ttl: 3600
        }
    },
    
    // 缓存配置
    config_cache: {
        enabled: env('CONFIG_CACHE', 'false') === 'true',
        path: './bootstrap/cache/config.json',
        ttl: 86400 // 24 hours
    }
};

function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

### 日志配置 (config/logging.js)

```javascript
export default {
    // 默认日志通道
    default: env('LOG_CHANNEL', 'file'),
    
    // 日志通道配置
    channels: {
        console: {
            driver: 'console',
            level: env('LOG_LEVEL', 'info'),
            format: 'simple'
        },
        
        file: {
            driver: 'file',
            path: env('LOG_FILE', './logs/buddy.log'),
            level: env('LOG_LEVEL', 'info'),
            maxFiles: 10,
            maxSize: '10m',
            format: 'json'
        },
        
        rotating: {
            driver: 'rotating-file',
            path: './logs/buddy-%DATE%.log',
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            maxSize: '20m'
        },
        
        remote: {
            driver: 'http',
            url: env('LOG_REMOTE_URL'),
            level: 'error',
            headers: {
                'Authorization': `Bearer ${env('LOG_REMOTE_TOKEN')}`
            }
        }
    },
    
    // 日志格式配置
    formatters: {
        simple: '${timestamp} [${level}] ${message}',
        detailed: '${timestamp} [${level}] [${context}] ${message} ${meta}',
        json: 'json'
    }
};

function env(key, defaultValue = null) {
    return process.env[key] ?? defaultValue;
}
```

## 环境变量文件 (.env)

```bash
# 应用配置
APP_NAME=Buddy
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:3000

# 窗口配置
WINDOW_WIDTH=1200
WINDOW_HEIGHT=800

# 数据库配置
DB_CONNECTION=sqlite
DB_DATABASE=./data/buddy.db

# 缓存配置
CACHE_DRIVER=file
CONFIG_CACHE=false

# 日志配置
LOG_CHANNEL=file
LOG_LEVEL=info

# 功能开关
ENABLE_AI=false
AUTO_UPDATE=true
CRASH_REPORTING=false

# API配置
API_URL=https://api.buddy.app
API_TOKEN=your_api_token_here

# 热键配置
HOTKEY_TOGGLE=Command+Space
```

## 高级用法

### 配置观察

```typescript
// 观察单个配置项
const unwatch = Config.watch('app.debug', (newValue, oldValue) => {
    console.log(`Debug mode changed: ${oldValue} -> ${newValue}`);
});

// 观察配置分支
Config.watch('app.window', (newWindow) => {
    // 窗口配置发生变化
    updateWindowSettings(newWindow);
});

// 取消观察
unwatch();
```

### 动态配置

```typescript
// 运行时修改配置
Config.set('app.theme', 'dark');
Config.set('app.window.width', 1400);

// 合并配置
Config.merge({
    app: {
        features: {
            new_feature: true
        }
    }
});

// 删除配置
Config.forget('app.temporary_setting');
```

### 配置缓存

```typescript
// 手动缓存配置
await Config.cache();

// 清除缓存
await Config.clearCache();

// 重新加载配置（会清除缓存）
await Config.reload();
```

### 配置分组

```typescript
// 获取应用相关的所有配置
const appConfig = Config.getConfig('app');

// 获取数据库相关的所有配置
const dbConfig = Config.getConfig('database');

// 获取窗口配置
const windowConfig = Config.getConfig('app.window');
```

## 与 Cosy 框架集成

### 服务提供者注册

```typescript
// bootstrap/providers.ts
import { ConfigServiceProvider } from '@buddy/foundation';

export const providers = [
    ConfigServiceProvider,
    // ... 其他服务提供者
];
```

### 容器解析

```typescript
import { Application } from '@coffic/cosy';

// 从容器获取配置管理器
const configManager = app.make('config');

// 获取配置助手函数
const configHelper = app.make('config.helper');
const appName = configHelper('app.name');
```

## 最佳实践

### 1. 配置文件组织

```
config/
├── app.js          # 应用核心配置
├── database.js     # 数据库配置
├── cache.js        # 缓存配置
├── logging.js      # 日志配置
├── plugins.js      # 插件配置
├── security.js     # 安全配置
└── services/       # 服务配置目录
    ├── ai.js       # AI服务配置
    ├── market.js   # 插件市场配置
    └── update.js   # 更新服务配置
```

### 2. 环境变量使用

```javascript
// 始终提供默认值
const dbHost = env('DB_HOST', 'localhost');

// 类型转换
const port = parseInt(env('APP_PORT', '3000'));
const debug = env('APP_DEBUG', 'false') === 'true';

// 复杂默认值
const features = {
    ai_chat: env('ENABLE_AI', 'false') === 'true',
    plugins: env('ENABLE_PLUGINS', 'true') === 'true'
};
```

### 3. 配置验证

```typescript
// 在应用启动时验证关键配置
function validateConfig() {
    const requiredKeys = [
        'app.name',
        'database.default',
        'cache.default'
    ];
    
    for (const key of requiredKeys) {
        if (!Config.has(key)) {
            throw new Error(`Required config key missing: ${key}`);
        }
    }
}
```

### 4. 性能优化

```typescript
// 缓存频繁访问的配置
const appConfig = Config.getConfig('app');
const windowWidth = appConfig.window.width;

// 避免在循环中重复获取配置
const batchSize = Config.get('processing.batch_size', 100);
for (let i = 0; i < items.length; i += batchSize) {
    // 处理批次...
}
```

## 故障排除

### 常见问题

1. **配置文件未找到**

   ```
   ❌ 配置文件加载失败: config/app.js not found
   ```

   解决方案：检查配置文件路径和文件名

2. **环境变量解析错误**

   ```javascript
   // 错误：直接使用环境变量
   database: process.env.DB_PATH,
   
   // 正确：使用 env 助手并提供默认值
   database: env('DB_PATH', './data/app.db'),
   ```

3. **配置缓存问题**

   ```typescript
   // 开发环境禁用缓存
   cache: {
       enabled: process.env.NODE_ENV === 'production'
   }
   ```

### 调试配置

```typescript
// 输出配置状态
console.log('Config Status:', Config.getStatus());

// 输出所有配置
console.log('All Config:', Config.all());

// 检查特定配置
if (Config.has('problematic.key')) {
    console.log('Value:', Config.get('problematic.key'));
} else {
    console.log('Key not found');
}
```

## 迁移指南

### 从旧配置系统迁移

如果你的项目之前使用其他配置方式，可以按以下步骤迁移：

1. **创建配置目录和文件**
2. **转换现有配置到新格式**
3. **更新配置访问代码**
4. **测试配置加载**

```typescript
// 旧方式
const config = require('./config.json');
const dbPath = config.database.path;

// 新方式
import { Config } from '@buddy/foundation';
const dbPath = Config.get('database.path');
```

## 总结

Buddy Foundation 配置系统提供了一个强大、灵活且易于使用的配置管理解决方案。它借鉴了 Laravel 的设计理念，同时针对 Electron 应用的特点进行了优化。通过合理使用配置系统，可以让你的应用更加易于维护和扩展。
