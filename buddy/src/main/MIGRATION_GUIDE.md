# Buddy 架构重构迁移指南

本指南将帮助你将现有的 Buddy 应用从当前架构迁移到基于 Laravel 思想的新架构。

## 🎯 重构目标

- **提高可维护性** - 清晰的依赖关系和模块化设计
- **增强扩展性** - 通过服务提供者和依赖注入支持插件
- **统一代码风格** - 参考成熟框架的最佳实践
- **简化测试** - 基于依赖注入的单元测试

## 📁 新架构目录结构

```
src/main/
├── app/                          # 应用核心
│   ├── Application.ts           # 应用主类 ✅ 已创建
│   ├── ServiceContainer.ts      # 服务容器 ✅ 已创建
│   └── Kernel.ts               # 应用内核
├── config/                      # 配置文件
│   ├── app.ts
│   ├── plugins.ts
│   └── services.ts
├── providers/                   # 服务提供者
│   ├── AppServiceProvider.ts
│   ├── PluginServiceProvider.ts ✅ 已创建
│   ├── ViewServiceProvider.ts
│   └── EventServiceProvider.ts
├── http/                       # IPC相关
│   ├── controllers/            # 控制器
│   ├── middleware/             # 中间件 ✅ 已创建
│   ├── requests/               # 请求验证
│   └── Router.ts              # 路由器 ✅ 已创建
├── services/                   # 业务服务
│   ├── PluginService.ts
│   ├── WindowService.ts
│   └── EventService.ts
├── models/                     # 模型/实体
│   ├── Plugin.ts
│   ├── Action.ts
│   └── View.ts
├── repositories/               # 仓储模式
│   ├── PluginRepository.ts
│   └── ActionRepository.ts
├── events/                     # 事件
├── listeners/                  # 事件监听器
├── facades/                    # 门面模式
└── bootstrap/                  # 启动文件
    └── app.ts                 # ✅ 已创建
```

## 🔄 迁移步骤

### 步骤 1: 迁移 Manager 到 Service

**原有代码 (managers/PluginManager.ts):**

```typescript
class PluginManager extends BaseManager {
  async initialize(): Promise<void> {
    // 初始化逻辑
  }
}
export const pluginManager = PluginManager.getInstance();
```

**新架构 (services/PluginService.ts):**

```typescript
export class PluginService {
  constructor(
    private repository: PluginRepository,
    private eventService: EventService
  ) {}

  async initialize(): Promise<void> {
    // 初始化逻辑
    this.eventService.emit('plugin:initialized');
  }
}
```

### 步骤 2: 迁移 IPC 处理器到控制器

**原有代码 (handlers/action_handler.ts):**

```typescript
export const actionRoutes: IpcRoute[] = [
  {
    channel: IPC_METHODS.GET_ACTIONS,
    handler: async (_, keyword = '') => {
      try {
        const actions = await actionManager.getActions(keyword);
        return { success: true, data: actions };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
];
```

**新架构 (http/controllers/PluginController.ts):**

```typescript
export class PluginController {
  constructor(private pluginService: PluginService) {}

  async getActions(request: IPCRequest): Promise<IPCResponse> {
    const [keyword = ''] = request.args;
    const actions = await this.pluginService.getActions(keyword);
    return { success: true, data: actions };
  }
}

// 路由注册
router.register('plugin:get-actions', (req) =>
  app.make<PluginController>('PluginController').getActions(req)
);
```

### 步骤 3: 使用服务提供者注册服务

```typescript
export class PluginServiceProvider extends ServiceProvider {
  public register(): void {
    // 注册仓储
    this.app.singleton('plugin.repository', () => new PluginRepository());

    // 注册服务
    this.app.singleton('plugin.service', (container) => {
      return new PluginService(
        container.resolve('plugin.repository'),
        container.resolve('event.service')
      );
    });

    // 注册控制器
    this.app.singleton('PluginController', (container) => {
      return new PluginController(container.resolve('plugin.service'));
    });
  }
}
```

## 🚀 启动新架构

### 修改入口文件 (index.ts)

**原有代码:**

```typescript
import { appManager } from './managers/AppManager.js';
import { routerService } from './provider/RouterService.js';

appManager.start().then(() => {
  routerService.initialize();
});
```

**新架构:**

```typescript
import { bootApplication } from './bootstrap/app.js';

bootApplication().catch(console.error);
```

## 🔧 配置文件

### config/app.ts

```typescript
export default {
  name: 'Buddy',
  version: '1.0.0',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV !== 'production',

  providers: [
    'AppServiceProvider',
    'PluginServiceProvider',
    'ViewServiceProvider',
    'EventServiceProvider',
  ],

  aliases: {
    Plugin: 'plugin.service',
    Window: 'window.service',
    Event: 'event.service',
  },
};
```

## 🧪 测试支持

新架构天然支持依赖注入，使测试更加容易：

```typescript
describe('PluginService', () => {
  let pluginService: PluginService;
  let mockRepository: jest.Mocked<PluginRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    pluginService = new PluginService(mockRepository, mockEventService);
  });

  it('should load plugins', async () => {
    mockRepository.getAll.mockResolvedValue([mockPlugin]);
    const plugins = await pluginService.getPlugins();
    expect(plugins).toEqual([mockPlugin]);
  });
});
```

## 📈 优势总结

1. **依赖注入** - 所有依赖都通过容器管理，易于测试和替换
2. **中间件支持** - 统一的请求处理流程，支持日志、验证、错误处理等
3. **服务提供者** - 模块化的服务注册，支持延迟加载
4. **路由系统** - 统一的 IPC 路由管理，支持命名路由和路由组
5. **门面模式** - 提供简洁的 API 访问，隐藏复杂的依赖关系

## 🔄 渐进式迁移

你可以渐进式地迁移到新架构：

1. **第一阶段** - 保留现有代码，添加新的服务容器和路由系统
2. **第二阶段** - 逐步将 Manager 改为 Service
3. **第三阶段** - 迁移 IPC 处理器到新的路由系统
4. **第四阶段** - 完善中间件和门面系统

这样可以确保应用在迁移过程中始终保持可用状态。
