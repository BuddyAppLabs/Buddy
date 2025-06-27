# Electron Laravel Framework

🍋 Laravel-inspired framework for Electron applications, providing dependency injection, service providers, middleware, and routing for IPC communication.

## 特性

- **依赖注入容器** - 管理应用服务和依赖
- **服务提供者模式** - 模块化的服务注册和启动
- **IPC 路由系统** - 类似 Laravel 的路由处理 IPC 通信
  - 支持路由分组和前缀
  - 内置参数验证
  - 中间件支持
  - 门面模式
- **中间件管道** - 洋葱模型的请求处理流程
- **门面模式** - 简化复杂依赖关系的 API
- **TypeScript 支持** - 完整的类型定义
- **生命周期管理** - 应用启动、运行和关闭的完整生命周期

## 安装

```bash
pnpm add @coffic/cosy-framework
```

## 快速开始

### 1. 创建应用

```typescript
import { bootElectronApp } from '@coffic/cosy-framework';

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
import { ServiceProvider } from '@coffic/cosy-framework';

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

### 3. 使用路由系统

```typescript
import { Route, router } from '@coffic/cosy-framework';

// 基本路由
router.register(
  Route.handle('plugin:list', async (event, ...args) => {
    // 处理逻辑
    return { success: true, data: plugins };
  })
);

// 带验证的路由
router.register(
  Route.post('plugin:create', async (event, data) => {
    // 创建插件逻辑
    return { success: true };
  })
  .validation({
    '0': {
      required: true,
      type: 'object',
      validator: (data) => {
        return data.name ? true : '插件名称是必填的';
      }
    }
  })
);

// 路由分组
router.group({
  name: 'plugins',
  prefix: 'plugin',
  middleware: [authMiddleware]
}, () => {
  router.get('list', listHandler);
  router.post('create', createHandler);
});

// 使用门面
import { RouteFacade } from '@coffic/cosy-framework';

RouteFacade.router.prefix('api').group({
  name: 'api',
  middleware: [apiMiddleware]
}, () => {
  // API 路由定义
});
```

### 4. 使用中间件

```typescript
import { ValidationMiddleware } from '@coffic/cosy-framework';

class PluginValidation extends ValidationMiddleware {
  protected validate(request: IPCRequest) {
    const [pluginId] = request.args;
    if (!pluginId) {
      return { success: false, error: 'Plugin ID is required' };
    }
    return { success: true };
  }
}

// 全局中间件
router.use(new PluginValidation());

// 路由中间件
router.register(
  Route.handle('plugin:update', handler)
    .middleware(new PluginValidation())
);
```

### 5. 创建门面

```