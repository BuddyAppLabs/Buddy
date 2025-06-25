# 门面模式 (facades/)

门面（Facade）提供了一个简洁的接口来访问容器中的复杂服务。参考 Laravel Facade 模式设计，让复杂的依赖注入变得简单易用。

## 📁 目录结构

```
facades/
├── Plugin.ts             # 插件门面
├── Window.ts             # 窗口门面 (待实现)
├── Event.ts              # 事件门面 (待实现)
├── Config.ts             # 配置门面 (待实现)
└── Log.ts                # 日志门面 (待实现)
```

## 🎯 门面概念

### 什么是门面？

门面是一种设计模式，它：

- **隐藏复杂性** - 隐藏服务的复杂依赖关系
- **提供简洁 API** - 提供静态方法风格的简洁接口
- **保持松耦合** - 底层实现可以随时替换
- **易于使用** - 无需了解依赖注入即可使用服务

### 门面 vs 直接注入

```typescript
// ❌ 直接使用容器（复杂）
const pluginService = container.resolve<PluginService>('plugin.service');
const plugins = await pluginService.getAll();

// ✅ 使用门面（简洁）
import { Plugin } from '@/facades/Plugin';
const plugins = await Plugin.getAll();
```

## 📖 门面实现

### Plugin.ts 门面示例

```typescript
import { container } from '@/app/ServiceContainer';

export interface PluginFacadeInterface {
  getAll(): Promise<any[]>;
  find(id: string): Promise<any | null>;
  install(id: string): Promise<boolean>;
  uninstall(id: string): Promise<boolean>;
  execute(actionId: string, keyword: string): Promise<any>;
}

// 门面实现
export const Plugin: PluginFacadeInterface =
  container.createFacade('plugin.service');
```

## 🔧 创建自定义门面

### 1. 定义接口

```typescript
// facades/Window.ts
export interface WindowFacadeInterface {
  create(options?: WindowOptions): Promise<BrowserWindow>;
  close(windowId: string): Promise<void>;
  show(windowId: string): Promise<void>;
  hide(windowId: string): Promise<void>;
  getAll(): BrowserWindow[];
}
```

### 2. 创建门面

```typescript
import { container } from '@/app/ServiceContainer';

export const Window: WindowFacadeInterface =
  container.createFacade('window.service');
```

### 3. 完整门面示例

```typescript
// facades/Event.ts
export interface EventFacadeInterface {
  emit(event: string, ...args: any[]): boolean;
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  once(event: string, listener: (...args: any[]) => void): void;
  listeners(event: string): Function[];
}

// 使用代理实现的门面
export const Event: EventFacadeInterface = new Proxy(
  {} as EventFacadeInterface,
  {
    get(target, prop) {
      const eventService = container.resolve<any>('event.service');
      const value = eventService[prop];
      return typeof value === 'function' ? value.bind(eventService) : value;
    },
  }
);
```

## 📋 门面使用示例

### 插件操作

```typescript
import { Plugin } from '@/facades/Plugin';

// 获取所有插件
const plugins = await Plugin.getAll();

// 查找特定插件
const plugin = await Plugin.find('plugin-id');

// 安装插件
const success = await Plugin.install('new-plugin-id');

// 执行插件动作
const result = await Plugin.execute('action-id', 'keyword');
```

### 窗口管理

```typescript
import { Window } from '@/facades/Window';

// 创建新窗口
const window = await Window.create({
  width: 800,
  height: 600,
  title: 'New Window',
});

// 显示窗口
await Window.show(window.id);

// 获取所有窗口
const windows = Window.getAll();
```

### 事件处理

```typescript
import { Event } from '@/facades/Event';

// 发射事件
Event.emit('plugin:installed', { pluginId: 'test-plugin' });

// 监听事件
Event.on('window:created', (windowInfo) => {
  console.log('New window created:', windowInfo);
});

// 一次性监听
Event.once('app:ready', () => {
  console.log('App is ready!');
});
```

## 🏗️ 高级门面特性

### 1. 带类型提示的门面

```typescript
// facades/Config.ts
export interface ConfigFacadeInterface {
  get<T = any>(key: string, defaultValue?: T): T;
  set(key: string, value: any): void;
  has(key: string): boolean;
  all(): Record<string, any>;
}

class ConfigFacade implements ConfigFacadeInterface {
  get<T = any>(key: string, defaultValue?: T): T {
    const configService = container.resolve<any>('config.service');
    return configService.get(key, defaultValue);
  }

  set(key: string, value: any): void {
    const configService = container.resolve<any>('config.service');
    configService.set(key, value);
  }

  has(key: string): boolean {
    const configService = container.resolve<any>('config.service');
    return configService.has(key);
  }

  all(): Record<string, any> {
    const configService = container.resolve<any>('config.service');
    return configService.all();
  }
}

export const Config = new ConfigFacade();
```

### 2. 缓存门面

```typescript
// facades/Cache.ts
export interface CacheFacadeInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

export const Cache: CacheFacadeInterface =
  container.createFacade('cache.service');

// 使用示例
await Cache.set('user:123', userData, 3600); // 1小时缓存
const user = await Cache.get('user:123');
```

### 3. 日志门面

```typescript
// facades/Log.ts
export interface LogFacadeInterface {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
  log(level: string, message: string, context?: any): void;
}

export const Log: LogFacadeInterface = container.createFacade('logger.service');

// 使用示例
Log.info('Plugin installed successfully', { pluginId: 'test-plugin' });
Log.error('Failed to load plugin', { error: errorMessage });
```

## 🚀 实际应用场景

### 1. 在控制器中使用

```typescript
// http/controllers/PluginController.ts
import { Plugin, Log, Event } from '@/facades';

export class PluginController {
  async install(request: IPCRequest): Promise<IPCResponse> {
    const [pluginId] = request.args;

    try {
      Log.info('Installing plugin', { pluginId });

      const success = await Plugin.install(pluginId);

      if (success) {
        Event.emit('plugin:installed', { pluginId });
        Log.info('Plugin installed successfully', { pluginId });
      }

      return { success, data: { pluginId } };
    } catch (error) {
      Log.error('Plugin installation failed', { pluginId, error });
      return { success: false, error: error.message };
    }
  }
}
```

### 2. 在中间件中使用

```typescript
// http/middleware/AuditMiddleware.ts
import { Log, Event } from '@/facades';

export class AuditMiddleware extends Middleware {
  public async handle(
    request: IPCRequest,
    next: NextFunction
  ): Promise<IPCResponse> {
    const startTime = Date.now();

    // 记录请求开始
    Log.debug('Request started', {
      channel: request.channel,
      args: request.args,
    });

    const response = await next();
    const duration = Date.now() - startTime;

    // 发射审计事件
    Event.emit('request:completed', {
      channel: request.channel,
      success: response.success,
      duration,
    });

    return response;
  }
}
```

## 📝 门面最佳实践

### 1. 保持接口简洁

```typescript
// ✅ 好的门面 - 简洁明了
export interface PluginFacadeInterface {
  getAll(): Promise<Plugin[]>;
  find(id: string): Promise<Plugin | null>;
  install(id: string): Promise<boolean>;
}

// ❌ 不好的门面 - 过于复杂
export interface BadPluginFacadeInterface {
  getAllPluginsWithDetailedInformationAndMetadata(): Promise<
    ComplexPluginData[]
  >;
  findPluginByIdWithDependencyResolutionAndValidation(
    id: string
  ): Promise<ComplexPlugin>;
}
```

### 2. 类型安全

```typescript
// ✅ 提供准确的类型定义
export interface TypedFacadeInterface {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
}

// ❌ 使用 any 类型
export interface UntypedFacadeInterface {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}
```

### 3. 错误处理

```typescript
export const Plugin: PluginFacadeInterface = new Proxy(
  {} as PluginFacadeInterface,
  {
    get(target, prop) {
      try {
        const pluginService = container.resolve<any>('plugin.service');
        const value = pluginService[prop];
        return typeof value === 'function' ? value.bind(pluginService) : value;
      } catch (error) {
        throw new Error(`Failed to access plugin service: ${error.message}`);
      }
    },
  }
);
```

## 🔄 与 Laravel 的对应关系

| Buddy                    | Laravel                     | 说明         |
| ------------------------ | --------------------------- | ------------ |
| Plugin                   | DB, Cache, Log 等           | 门面类       |
| container.createFacade() | Facade::getFacadeAccessor() | 门面创建     |
| PluginFacadeInterface    | -                           | 类型定义接口 |

## 🧪 测试门面

### 1. 模拟门面

```typescript
describe('PluginController', () => {
  beforeEach(() => {
    // 模拟门面
    jest.mocked(Plugin.install).mockResolvedValue(true);
    jest.mocked(Plugin.find).mockResolvedValue(mockPlugin);
  });

  it('should install plugin successfully', async () => {
    const controller = new PluginController();
    const response = await controller.install(mockRequest);

    expect(Plugin.install).toHaveBeenCalledWith('plugin-id');
    expect(response.success).toBe(true);
  });
});
```

### 2. 集成测试

```typescript
describe('Plugin Facade Integration', () => {
  let app: Application;

  beforeEach(async () => {
    app = createTestApp();
    await app.boot();
  });

  it('should work with real services', async () => {
    const plugins = await Plugin.getAll();
    expect(Array.isArray(plugins)).toBe(true);
  });
});
```
