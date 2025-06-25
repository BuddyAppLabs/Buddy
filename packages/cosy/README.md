# Electron Laravel Framework

🍋 Laravel-inspired framework for Electron applications, providing dependency injection, service providers, middleware, and routing for IPC communication.

## 特性

- **依赖注入容器** - 管理应用服务和依赖
- **服务提供者模式** - 模块化的服务注册和启动
- **IPC 路由系统** - 类似 Laravel 的路由处理 IPC 通信
- **中间件管道** - 洋葱模型的请求处理流程
- **门面模式** - 简化复杂依赖关系的 API
- **TypeScript 支持** - 完整的类型定义
- **生命周期管理** - 应用启动、运行和关闭的完整生命周期

## 安装

```bash
pnpm add @coffic/electron-laravel-framework
```

## 快速开始

### 1. 创建应用

```typescript
import { bootElectronApp } from '@coffic/cosy';

const app = await bootElectronApp({
  name: 'MyElectronApp',
  version: '1.0.0',
  env: 'development',
  debug: true,
  providers: [
    // 你的服务提供者
  ],
});
```

### 2. 创建服务提供者

```typescript
import { ServiceProvider } from '@coffic/cosy';

export class PluginServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton('plugin.service', (container) => {
      return new PluginService();
    });
  }

  public async boot(): Promise<void> {
    // 启动逻辑
  }
}
```

### 3. 注册路由

```typescript
import { router } from '@coffic/cosy';

// 注册 IPC 路由
router.register('plugin:list', async (request) => {
  const [keyword] = request.args;
  // 处理逻辑
  return { success: true, data: plugins };
});
```

### 4. 使用中间件

```typescript
import { ValidationMiddleware } from '@coffic/cosy';

class PluginValidation extends ValidationMiddleware {
  protected validate(request: IPCRequest) {
    const [pluginId] = request.args;
    if (!pluginId) {
      return { success: false, error: 'Plugin ID is required' };
    }
    return { success: true };
  }
}

router.register('plugin:install', handler, [new PluginValidation()]);
```

### 5. 创建门面

```typescript
import { BaseFacade, createFacade } from '@coffic/cosy';

class PluginFacade extends BaseFacade {
  public getFacadeAccessor(): string {
    return 'plugin.service';
  }
}

export const Plugin = createFacade<PluginService>(PluginFacade);

// 使用
const plugins = await Plugin.getAll();
```

## 架构概述

```
Application Layer
├── Bootstrap (应用启动)
├── Service Providers (服务提供者)
└── Configuration (配置管理)

IPC Layer
├── Router (路由)
├── Middleware (中间件)
└── Controllers (控制器)

Service Layer
├── Container (依赖注入容器)
├── Facades (门面)
└── Services (业务服务)
```

## 核心概念

### 依赖注入容器

```typescript
import { container } from '@coffic/cosy';

// 绑定服务
container.singleton('logger', () => new Logger());

// 解析服务
const logger = container.resolve<Logger>('logger');
```

### 服务提供者生命周期

1. **register()** - 注册服务到容器
2. **boot()** - 启动服务（所有服务注册完成后）
3. **shutdown()** - 关闭服务（应用关闭时）

### 中间件管道

中间件采用洋葱模型，按顺序执行：

```typescript
Request → Middleware1 → Middleware2 → Handler → Middleware2 → Middleware1 → Response
```

## API 参考

### Application

- `boot()` - 启动应用
- `run()` - 运行应用
- `register(provider)` - 注册服务提供者
- `make<T>(abstract)` - 解析服务
- `singleton<T>(abstract, factory)` - 绑定单例服务

### Router

- `register(channel, handler, middleware?)` - 注册路由
- `use(middleware)` - 注册全局中间件
- `dispatch(channel, args)` - 分发请求

### Container

- `bind<T>(abstract, factory, singleton?)` - 绑定服务
- `singleton<T>(abstract, factory)` - 绑定单例
- `resolve<T>(abstract)` - 解析服务
- `alias(alias, abstract)` - 设置别名

## 最佳实践

1. **模块化设计** - 使用服务提供者组织代码
2. **依赖注入** - 避免硬编码依赖
3. **中间件复用** - 提取通用逻辑到中间件
4. **门面简化** - 使用门面提供简洁的 API
5. **类型安全** - 充分利用 TypeScript 类型系统

## 许可证

MIT
