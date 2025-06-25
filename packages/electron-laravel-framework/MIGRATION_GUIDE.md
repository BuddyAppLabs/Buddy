# 迁移指南：从现有架构到 Electron Laravel Framework

本指南将帮助你将现有的 Buddy 项目从当前的 Manager 模式迁移到基于 Laravel 思想的框架架构。

## 迁移概览

### 迁移前后对比

| 现有架构 | 新框架 | 说明 |
| --- | --- | --- |
| `managers/AppManager.js` | `@coffic/electron-laravel-framework` | 应用核心 |
| `provider/RouterService.js` | `Router` | IPC 路由 |
| `handlers/*.js` | 控制器 + 中间件 | 请求处理 |
| 手动初始化 | `bootElectronApp()` | 应用启动 |
| 直接依赖 | 依赖注入容器 | 服务管理 |

## 第一阶段：基础架构迁移

### 1. 更新主入口文件

**原有代码** (`buddy/src/main/index.ts`):

```typescript
import { appManager } from './managers/AppManager.js';
import { routerService } from './provider/RouterService.js';

routerService.registerRoutes(baseRoutes);
// ...

appManager.start().then(() => {
  routerService.initialize();
});
```

**新代码**:

```typescript
import { bootElectronApp } from '@coffic/electron-laravel-framework';
import { PluginServiceProvider } from './providers/PluginServiceProvider.js';
import { registerRoutes } from './bootstrap/routes.js';

const app = await bootElectronApp({
  name: 'Buddy',
  version: '1.3.18',
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    PluginServiceProvider,
    // ... 其他服务提供者
  ],
});

// 注册路由
registerRoutes();
```

### 2. 创建服务提供者

将现有的 Manager 转换为服务提供者：

**创建** `buddy/src/main/providers/PluginServiceProvider.ts`:

```typescript
import { ServiceProvider } from '@coffic/electron-laravel-framework';
import { PluginManager } from '../managers/PluginManager.js';

export class PluginServiceProvider extends ServiceProvider {
  public register(): void {
    // 注册插件管理器为单例
    this.app.singleton('plugin.manager', () => {
      return new PluginManager();
    });

    // 注册别名
    this.app.container().alias('PluginManager', 'plugin.manager');
  }

  public async boot(): Promise<void> {
    const pluginManager = this.app.make<PluginManager>('plugin.manager');
    await pluginManager.initialize();
  }

  public async shutdown(): Promise<void> {
    const pluginManager = this.app.make<PluginManager>('plugin.manager');
    await pluginManager.cleanup();
  }
}
```

### 3. 转换路由注册

**创建** `buddy/src/main/bootstrap/routes.ts`:

```typescript
import { router } from '@coffic/electron-laravel-framework';
import { PluginController } from '../controllers/PluginController.js';
import {
  LoggingMiddleware,
  ErrorHandlingMiddleware,
} from '@coffic/electron-laravel-framework';

export function registerRoutes(): void {
  const pluginController = new PluginController();

  // 注册插件相关路由
  router
    .register('plugin:list', pluginController.list, [
      new LoggingMiddleware(),
      new ErrorHandlingMiddleware(),
    ])
    .name('plugin.list');

  router
    .register('plugin:install', pluginController.install, [
      new LoggingMiddleware(),
      new ErrorHandlingMiddleware(),
    ])
    .name('plugin.install');

  // ... 其他路由
}
```

## 第二阶段：控制器重构

### 1. 创建控制器基类

**创建** `buddy/src/main/controllers/BaseController.ts`:

```typescript
import { IPCRequest, IPCResponse } from '@coffic/electron-laravel-framework';
import { app } from '@coffic/electron-laravel-framework';

export abstract class BaseController {
  protected app = app();

  protected success<T>(
    data: T,
    metadata?: Record<string, any>
  ): IPCResponse<T> {
    return { success: true, data, metadata };
  }

  protected error(
    message: string,
    metadata?: Record<string, any>
  ): IPCResponse {
    return { success: false, error: message, metadata };
  }

  protected resolve<T>(abstract: string): T {
    return this.app.make<T>(abstract);
  }
}
```

### 2. 重构现有处理器

**原有代码** (`buddy/src/main/handlers/action_handler.ts`):

```typescript
export const actionRoutes = [
  {
    channel: 'action:list',
    handler: async (args: unknown[]) => {
      // 处理逻辑
    },
  },
];
```

**新控制器** (`buddy/src/main/controllers/ActionController.ts`):

```typescript
import { IPCRequest, IPCResponse } from '@coffic/electron-laravel-framework';
import { BaseController } from './BaseController.js';
import { ActionManager } from '../managers/ActionManager.js';

export class ActionController extends BaseController {
  public async list(request: IPCRequest): Promise<IPCResponse> {
    try {
      const [keyword] = request.args;
      const actionManager = this.resolve<ActionManager>('action.manager');
      const actions = await actionManager.list(keyword);

      return this.success(actions, { total: actions.length });
    } catch (error) {
      return this.error('Failed to list actions');
    }
  }
}
```

## 第三阶段：中间件实现

### 1. 创建验证中间件

**创建** `buddy/src/main/middleware/ValidationMiddleware.ts`:

```typescript
import {
  ValidationMiddleware,
  IPCRequest,
} from '@coffic/electron-laravel-framework';

export class PluginIdValidation extends ValidationMiddleware {
  protected validate(request: IPCRequest): {
    success: boolean;
    error?: string;
  } {
    const [pluginId] = request.args;

    if (!pluginId || typeof pluginId !== 'string') {
      return { success: false, error: 'Valid plugin ID is required' };
    }

    return { success: true };
  }
}
```

### 2. 应用中间件

```typescript
import { PluginIdValidation } from '../middleware/ValidationMiddleware.js';

router.register('plugin:install', pluginController.install, [
  new PluginIdValidation(),
  new LoggingMiddleware(),
]);
```

## 第四阶段：门面模式

### 1. 创建插件门面

**创建** `buddy/src/main/facades/Plugin.ts`:

```typescript
import { BaseFacade, createFacade } from '@coffic/electron-laravel-framework';
import { PluginManager } from '../managers/PluginManager.js';

class PluginFacade extends BaseFacade {
  public getFacadeAccessor(): string {
    return 'plugin.manager';
  }
}

export const Plugin = createFacade<PluginManager>(PluginFacade);
```

### 2. 使用门面

```typescript
import { Plugin } from '../facades/Plugin.js';

// 简化的插件操作
const plugins = await Plugin.getAll();
const plugin = await Plugin.install('plugin-id');
```

## 迁移清单

### ✅ 已完成的步骤

1. [ ] 创建框架包结构
2. [ ] 更新项目依赖
3. [ ] 重构主入口文件
4. [ ] 创建服务提供者
5. [ ] 重构路由系统
6. [ ] 创建控制器
7. [ ] 实现中间件
8. [ ] 创建门面

### 📝 迁移后的代码结构

```
buddy/src/main/
├── bootstrap/
│   ├── app.ts          # 应用启动配置
│   └── routes.ts       # 路由注册
├── controllers/
│   ├── BaseController.ts
│   ├── PluginController.ts
│   └── ActionController.ts
├── providers/
│   ├── PluginServiceProvider.ts
│   └── ActionServiceProvider.ts
├── middleware/
│   └── ValidationMiddleware.ts
├── facades/
│   ├── Plugin.ts
│   └── Action.ts
├── managers/         # 保留现有管理器
│   ├── PluginManager.ts
│   └── ActionManager.ts
└── index.ts          # 新的主入口
```

## 渐进式迁移策略

### 阶段 1：基础设施（1-2天）

- 设置框架包
- 迁移应用启动逻辑
- 创建核心服务提供者

### 阶段 2：路由和控制器（2-3天）

- 重构IPC处理器为控制器
- 迁移路由注册
- 添加基础中间件

### 阶段 3：服务和门面（1-2天）

- 完善服务提供者
- 创建门面
- 优化依赖注入

### 阶段 4：测试和优化（1-2天）

- 编写测试
- 性能优化
- 文档更新

## 注意事项

1. **保持向后兼容**：在迁移过程中保留原有代码，确保功能正常
2. **逐步迁移**：不要一次性迁移所有代码，按模块逐步进行
3. **测试验证**：每个阶段完成后都要进行充分测试
4. **文档更新**：及时更新相关文档和注释

## 遇到问题？

如果在迁移过程中遇到问题，可以：

1. 查看框架包的 README 和 API 文档
2. 参考现有的示例代码
3. 在 GitHub 上提交 Issue
4. 查看迁移前后的对比示例

迁移完成后，你将拥有一个更加模块化、可维护和可扩展的 Electron 应用架构！
