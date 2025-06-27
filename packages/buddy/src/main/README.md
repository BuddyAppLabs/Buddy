# Buddy 主进程架构 (src/main/)

基于 Laravel 思想重构的 Electron 主进程架构，提供清晰的分层设计、依赖注入和可扩展的插件系统。

## 📁 整体架构

```
src/main/
├── app/                    # 🏗️ 应用核心 - 容器和应用类
│   ├── Application.ts      # 应用主类，管理生命周期
│   └── ServiceContainer.ts # 依赖注入容器
├── providers/              # 📦 服务提供者 - 服务注册中心
│   ├── ServiceProvider.ts  # 服务提供者基类
│   └── PluginServiceProvider.ts # 插件服务提供者
├── http/                   # 🌐 IPC 处理层 - 类似 HTTP
│   ├── Router.ts           # IPC 路由器
│   ├── middleware/         # 中间件系统
│   ├── controllers/        # 控制器 (待实现)
│   └── requests/           # 请求验证 (待实现)
├── services/               # 💼 业务服务层 - 业务逻辑
│   ├── PluginService.ts    # 插件业务服务 (待实现)
│   └── WindowService.ts    # 窗口管理服务 (待实现)
├── repositories/           # 🗄️ 数据访问层 - 仓储模式
│   └── PluginRepository.ts # 插件数据仓储 (待实现)
├── models/                 # 📋 数据模型层 - 实体类
│   ├── Plugin.ts           # 插件模型 (待实现)
│   └── Action.ts           # 动作模型 (待实现)
├── events/                 # 📡 事件系统 - 应用事件
│   └── PluginLoaded.ts     # 插件事件 (待实现)
├── listeners/              # 👂 事件监听器 - 事件处理
│   └── PluginEventListener.ts # 插件事件监听 (待实现)
├── facades/                # 🎭 门面模式 - 简化 API
│   └── Plugin.ts           # 插件门面
├── bootstrap/              # 🚀 应用启动 - 初始化文件
│   └── app.ts              # 主启动文件
├── config/                 # ⚙️ 配置管理 - 配置文件
│   └── app.ts              # 应用配置 (待实现)
└── utils/                  # 🛠️ 工具函数 - 辅助工具
    └── helpers.ts          # 通用工具 (待实现)
```

## 🏛️ 架构设计理念

### 分层架构

```
┌─────────────────────────────────────────┐
│            IPC Layer (HTTP)             │ ← 请求/响应处理
├─────────────────────────────────────────┤
│          Business Layer                 │ ← 业务逻辑
├─────────────────────────────────────────┤
│           Data Layer                    │ ← 数据访问
├─────────────────────────────────────────┤
│         Infrastructure                  │ ← 基础设施
└─────────────────────────────────────────┘
```

### 依赖关系

```
Controllers → Services → Repositories → Models
     ↓           ↓            ↓
Middleware → Events → Listeners
     ↓
  Facades
```

## 🎯 核心组件说明

### 1. **应用核心 (app/)**

- **Application**: 应用生命周期管理，类似 Laravel Application
- **ServiceContainer**: 依赖注入容器，管理所有服务

### 2. **服务提供者 (providers/)**

- 负责将服务绑定到容器
- 管理服务的启动和关闭
- 类似 Laravel Service Providers

### 3. **IPC 处理 (http/)**

- **Router**: 将 IPC 频道映射到控制器
- **Middleware**: 提供横切关注点（日志、验证、错误处理）
- **Controllers**: 处理具体的 IPC 请求

### 4. **业务服务 (services/)**

- 封装复杂的业务逻辑
- 协调多个仓储和外部服务
- 发射业务事件

### 5. **数据访问 (repositories/)**

- 抽象数据访问逻辑
- 提供一致的数据接口
- 隐藏具体的存储实现

### 6. **数据模型 (models/)**

- 表示业务实体
- 包含实体的属性和行为
- 提供数据验证

### 7. **事件系统 (events/ & listeners/)**

- **Events**: 定义应用中的事件
- **Listeners**: 处理事件响应
- 实现松耦合的组件通信

### 8. **门面模式 (facades/)**

- 提供简洁的静态 API
- 隐藏依赖注入的复杂性
- 类似 Laravel Facades

## 🚀 使用示例

### 基本使用流程

#### 1. 启动应用

```typescript
// src/main/index.ts
import { bootApplication } from './bootstrap/app.js';

bootApplication().catch(console.error);
```

#### 2. 注册服务

```typescript
// providers/PluginServiceProvider.ts
export class PluginServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton('plugin.service', (container) => {
      return new PluginService(container.resolve('plugin.repository'));
    });
  }
}
```

#### 3. 定义路由

```typescript
// bootstrap/routes.ts
router.register('plugin:list', async (request) => {
  const pluginController = app.make('PluginController');
  return await pluginController.list(request);
});
```

#### 4. 使用门面

```typescript
// 在任何地方使用
import { Plugin } from '@/facades/Plugin';

const plugins = await Plugin.getAll();
await Plugin.install('new-plugin');
```

## 📋 开发指南

### 新增功能的步骤

#### 1. 创建模型

```typescript
// models/User.ts
export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  isAdmin(): boolean {
    return this.email.endsWith('@admin.com');
  }
}
```

#### 2. 创建仓储

```typescript
// repositories/UserRepository.ts
export class UserRepository {
  async find(id: string): Promise<User | null> {
    // 数据访问逻辑
  }

  async save(user: User): Promise<void> {
    // 保存逻辑
  }
}
```

#### 3. 创建服务

```typescript
// services/UserService.ts
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(userData: any): Promise<User> {
    // 业务逻辑
    const user = new User(userData.id, userData.name, userData.email);
    await this.userRepository.save(user);
    return user;
  }
}
```

#### 4. 创建控制器

```typescript
// http/controllers/UserController.ts
export class UserController {
  constructor(private userService: UserService) {}

  async create(request: IPCRequest): Promise<IPCResponse> {
    const [userData] = request.args;
    const user = await this.userService.createUser(userData);
    return { success: true, data: user };
  }
}
```

#### 5. 注册服务提供者

```typescript
// providers/UserServiceProvider.ts
export class UserServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.bind('user.repository', () => new UserRepository());
    this.app.singleton('user.service', (container) => {
      return new UserService(container.resolve('user.repository'));
    });
    this.app.singleton('UserController', (container) => {
      return new UserController(container.resolve('user.service'));
    });
  }
}
```

#### 6. 注册路由

```typescript
// bootstrap/routes.ts
router.register('user:create', (req) => {
  const controller = app.make('UserController');
  return controller.create(req);
});
```

## 🔧 配置和扩展

### 环境配置

```typescript
// config/app.ts
export default {
  name: process.env.APP_NAME || 'Buddy',
  version: process.env.APP_VERSION || '1.0.0',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',

  providers: [
    'AppServiceProvider',
    'PluginServiceProvider',
    'UserServiceProvider',
  ],
};
```

### 中间件注册

```typescript
// bootstrap/middleware.ts
router.addGlobalMiddleware(new ErrorHandlingMiddleware());
router.addGlobalMiddleware(new LoggingMiddleware());
router.addGlobalMiddleware(new ValidationMiddleware());
```

## 🧪 测试支持

### 单元测试

```typescript
describe('PluginService', () => {
  let service: PluginService;
  let mockRepository: jest.Mocked<PluginRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new PluginService(mockRepository);
  });

  it('should install plugin', async () => {
    mockRepository.install.mockResolvedValue(mockPlugin);
    const result = await service.installPlugin('test-plugin');
    expect(result).toBe(true);
  });
});
```

### 集成测试

```typescript
describe('Plugin API', () => {
  let app: Application;

  beforeAll(async () => {
    app = createTestApp();
    await app.boot();
  });

  it('should handle plugin installation', async () => {
    const response = await invokeIPC('plugin:install', ['test-plugin']);
    expect(response.success).toBe(true);
  });
});
```

## 📊 性能和监控

### 日志记录

```typescript
import { Log } from '@/facades/Log';

Log.info('Plugin installed', { pluginId: 'test' });
Log.error('Installation failed', { error: errorMessage });
```

### 性能监控

```typescript
// 中间件自动记录请求时间
// 事件系统监控关键操作
Event.emit('plugin:performance', {
  action: 'install',
  duration: 1200,
  memory: process.memoryUsage(),
});
```

## 🔄 与 Laravel 的对应关系

| Buddy            | Laravel                            | 说明       |
| ---------------- | ---------------------------------- | ---------- |
| Application      | Illuminate\Foundation\Application  | 应用容器   |
| ServiceContainer | Illuminate\Container\Container     | 依赖注入   |
| ServiceProvider  | Illuminate\Support\ServiceProvider | 服务提供者 |
| Router           | Illuminate\Routing\Router          | 路由系统   |
| Middleware       | Illuminate\Http\Middleware         | 中间件     |
| Facade           | Illuminate\Support\Facades\Facade  | 门面模式   |
| Event            | Illuminate\Events\Event            | 事件系统   |

## 📚 扩展阅读

- [Laravel 架构概念](https://laravel.com/docs/architecture-concepts)
- [依赖注入模式](https://en.wikipedia.org/wiki/Dependency_injection)
- [仓储模式](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- [事件驱动架构](https://martinfowler.com/articles/201701-event-driven.html)

---

这个架构提供了清晰的分离关注点、易于测试的依赖注入、灵活的扩展机制和统一的错误处理。通过参考 Laravel 的成熟模式，让 Electron 应用具备了企业级的架构质量。
