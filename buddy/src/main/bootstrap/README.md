# 应用启动 (bootstrap/)

这个目录包含应用的启动文件，负责应用的初始化、配置加载和服务提供者注册。参考 Laravel 的 `bootstrap/` 目录设计。

## 📁 目录结构

```
bootstrap/
├── app.ts                # 主启动文件
├── providers.ts          # 服务提供者注册 (待实现)
├── middleware.ts         # 中间件注册 (待实现)
└── routes.ts             # 路由注册 (待实现)
```

## 🎯 启动流程

### 应用启动生命周期

```
1. 创建应用实例 (createApp)
2. 注册服务提供者 (register)
3. 等待 Electron 就绪 (electronApp.whenReady)
4. 启动应用 (app.boot)
5. 注册路由和中间件 (router.initialize)
6. 运行应用 (app.run)
```

## 📖 主启动文件 (app.ts)

### 当前实现

```typescript
import { app as electronApp } from 'electron';
import { createApp, ApplicationConfig } from '../app/Application.js';
import { PluginServiceProvider } from '../providers/PluginServiceProvider.js';
import { router } from '../http/Router.js';
import {
  LoggingMiddleware,
  ErrorHandlingMiddleware,
  ValidationMiddleware,
} from '../http/middleware/Middleware.js';

// 应用配置
const config: ApplicationConfig = {
  name: 'Buddy',
  version: '1.0.0',
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  debug: process.env.NODE_ENV !== 'production',
};

// 创建应用实例
const app = createApp(config);

// 注册服务提供者
app.register(PluginServiceProvider);

// 配置全局中间件
router
  .addGlobalMiddleware(new ErrorHandlingMiddleware())
  .addGlobalMiddleware(new ValidationMiddleware())
  .addGlobalMiddleware(new LoggingMiddleware());

// 启动应用
export async function bootApplication(): Promise<void> {
  await electronApp.whenReady();
  await app.boot();
  router.initialize();
  await app.run();
}
```

## 🔧 扩展启动文件

### 1. 模块化配置 (providers.ts)

```typescript
// bootstrap/providers.ts
import { Application } from '@/app/Application';
import { AppServiceProvider } from '@/providers/AppServiceProvider';
import { PluginServiceProvider } from '@/providers/PluginServiceProvider';
import { ViewServiceProvider } from '@/providers/ViewServiceProvider';
import { EventServiceProvider } from '@/providers/EventServiceProvider';

/**
 * 注册所有服务提供者
 */
export function registerProviders(app: Application): void {
  // 核心服务提供者（按顺序注册）
  app.register(AppServiceProvider);
  app.register(EventServiceProvider);

  // 功能服务提供者
  app.register(PluginServiceProvider);
  app.register(ViewServiceProvider);

  // 第三方服务提供者
  // app.register(CustomServiceProvider);
}
```

### 2. 中间件配置 (middleware.ts)

```typescript
// bootstrap/middleware.ts
import { router } from '@/http/Router';
import {
  ErrorHandlingMiddleware,
  LoggingMiddleware,
  ValidationMiddleware,
  ThrottleMiddleware,
  AuthMiddleware,
} from '@/http/middleware';

/**
 * 注册全局中间件
 */
export function registerGlobalMiddleware(): void {
  // 错误处理（最先执行）
  router.addGlobalMiddleware(new ErrorHandlingMiddleware());

  // 限流中间件
  router.addGlobalMiddleware(new ThrottleMiddleware(100, 60000)); // 每分钟100次请求

  // 日志中间件
  router.addGlobalMiddleware(new LoggingMiddleware());

  // 基础验证
  router.addGlobalMiddleware(new ValidationMiddleware());
}

/**
 * 注册路由组中间件
 */
export function registerRouteMiddleware(): void {
  // 管理员路由组
  router.group([new AuthMiddleware()], (router) => {
    // 管理员路由将在 routes.ts 中定义
  });
}
```

### 3. 路由配置 (routes.ts)

```typescript
// bootstrap/routes.ts
import { router } from '@/http/Router';
import { app } from '@/app/Application';

/**
 * 注册应用路由
 */
export function registerRoutes(): void {
  // 应用基础路由
  registerAppRoutes();

  // 插件相关路由
  registerPluginRoutes();

  // 管理相关路由
  registerAdminRoutes();
}

function registerAppRoutes(): void {
  // 获取应用版本
  router
    .register('app:version', async () => {
      return {
        success: true,
        data: {
          version: app().config('version'),
          name: app().config('name'),
          env: app().config('env'),
        },
      };
    })
    .name('app.version');

  // 获取应用状态
  router
    .register('app:status', async () => {
      return {
        success: true,
        data: {
          running: app().isRunning(),
          booted: app().isBooted(),
          uptime: process.uptime(),
        },
      };
    })
    .name('app.status');
}

function registerPluginRoutes(): void {
  const pluginController = app().make('PluginController');

  router
    .register('plugin:list', (req) => pluginController.list(req))
    .name('plugin.list');

  router
    .register('plugin:install', (req) => pluginController.install(req))
    .name('plugin.install');

  router
    .register('plugin:uninstall', (req) => pluginController.uninstall(req))
    .name('plugin.uninstall');
}

function registerAdminRoutes(): void {
  // 需要认证的管理路由
  router.group([new AuthMiddleware()], (router) => {
    router
      .register('admin:settings', adminController.settings)
      .name('admin.settings');

    router.register('admin:logs', adminController.logs).name('admin.logs');
  });
}
```

### 4. 完整的模块化启动文件

```typescript
// bootstrap/app.ts (重构版本)
import { app as electronApp } from 'electron';
import { createApp, ApplicationConfig } from '@/app/Application';
import { loadConfig } from '@/config';
import { registerProviders } from './providers';
import {
  registerGlobalMiddleware,
  registerRouteMiddleware,
} from './middleware';
import { registerRoutes } from './routes';
import { router } from '@/http/Router';

/**
 * 创建和配置应用
 */
function createAndConfigureApp(): Application {
  // 加载配置
  const config = loadConfig();

  // 创建应用实例
  const app = createApp(config);

  // 注册服务提供者
  registerProviders(app);

  return app;
}

/**
 * 配置路由和中间件
 */
function configureRouting(): void {
  // 注册全局中间件
  registerGlobalMiddleware();

  // 注册路由组中间件
  registerRouteMiddleware();

  // 注册路由
  registerRoutes();
}

/**
 * 启动应用
 */
export async function bootApplication(): Promise<void> {
  try {
    console.log('🚀 正在启动 Buddy 应用...');

    // 创建应用
    const app = createAndConfigureApp();

    // 等待 Electron 就绪
    await electronApp.whenReady();
    console.log('✅ Electron 已就绪');

    // 启动应用
    await app.boot();
    console.log('✅ 应用已启动');

    // 配置路由
    configureRouting();
    router.initialize();
    console.log('✅ 路由已配置');

    // 运行应用
    await app.run();
    console.log('🎉 Buddy 应用启动完成');

    // 输出应用信息
    logApplicationInfo(app);
  } catch (error) {
    console.error('❌ 应用启动失败:', error);
    process.exit(1);
  }
}

/**
 * 关闭应用
 */
export async function shutdownApplication(): Promise<void> {
  try {
    console.log('👋 正在关闭 Buddy 应用...');

    const app = require('@/app/Application').app();
    await app.shutdown();

    console.log('✅ 应用已安全关闭');
  } catch (error) {
    console.error('❌ 应用关闭失败:', error);
  }
}

/**
 * 输出应用信息
 */
function logApplicationInfo(app: Application): void {
  const config = app.config();

  console.log('\n📋 应用信息:');
  console.log(`   名称: ${config.name}`);
  console.log(`   版本: ${config.version}`);
  console.log(`   环境: ${config.env}`);
  console.log(`   调试: ${config.debug ? '开启' : '关闭'}`);
  console.log(`   进程: ${process.pid}`);
  console.log(
    `   内存: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\n`
  );
}

// 设置进程事件监听
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 设置 Electron 事件监听
electronApp.on('will-quit', async () => {
  await shutdownApplication();
});

export { createAndConfigureApp };
```

## 🚀 使用启动文件

### 1. 在主进程中使用

```typescript
// src/main/index.ts
import { bootApplication } from './bootstrap/app.js';

// 启动应用
bootApplication().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
```

### 2. 测试环境启动

```typescript
// tests/setup.ts
import { createAndConfigureApp } from '@/bootstrap/app';

export function createTestApp(): Application {
  process.env.NODE_ENV = 'test';

  const app = createAndConfigureApp();

  // 测试环境特殊配置
  app.bind('test.mode', () => true);

  return app;
}
```

## 📝 最佳实践

### 1. 环境配置

```typescript
// 根据环境加载不同配置
const config: ApplicationConfig = {
  name: 'Buddy',
  version: process.env.APP_VERSION || '1.0.0',
  env: (process.env.NODE_ENV as any) || 'development',
  debug: process.env.NODE_ENV !== 'production',
};
```

### 2. 错误处理

```typescript
export async function bootApplication(): Promise<void> {
  try {
    // 启动逻辑
  } catch (error) {
    // 记录错误
    console.error('Application boot failed:', error);

    // 清理资源
    await cleanup();

    // 退出进程
    process.exit(1);
  }
}
```

### 3. 优雅关闭

```typescript
// 监听关闭信号
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await shutdownApplication();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await shutdownApplication();
  process.exit(0);
});
```

## 🔄 与 Laravel 的对应关系

| Buddy               | Laravel                | 说明           |
| ------------------- | ---------------------- | -------------- |
| bootstrap/app.ts    | bootstrap/app.php      | 主启动文件     |
| bootApplication()   | Application::boot()    | 启动方法       |
| registerProviders() | 配置文件中的 providers | 服务提供者注册 |
| configureRouting()  | routes/ 目录           | 路由配置       |

## 🧪 测试启动过程

```typescript
describe('Application Bootstrap', () => {
  it('should create app with correct config', () => {
    const app = createAndConfigureApp();

    expect(app.config('name')).toBe('Buddy');
    expect(app.isBooted()).toBe(false);
  });

  it('should boot successfully', async () => {
    const app = createAndConfigureApp();
    await app.boot();

    expect(app.isBooted()).toBe(true);
    expect(app.container().bound('plugin.service')).toBe(true);
  });
});
```
