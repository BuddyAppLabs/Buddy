# 服务提供者 (providers/)

服务提供者是应用的引导中心，负责将服务绑定到服务容器中。参考 Laravel 的服务提供者模式设计。

## 🎯 设计理念

### 什么是服务提供者？

服务提供者是连接服务容器和具体服务的桥梁。它们定义了：

- **服务如何创建** - 通过工厂函数
- **服务的依赖关系** - 依赖注入
- **服务的生命周期** - 单例或瞬态
- **服务的启动逻辑** - 初始化代码

### 生命周期

服务提供者有三个主要生命周期方法：

1. **register()** - 注册服务到容器（必须实现）
2. **boot()** - 启动服务（可选）
3. **shutdown()** - 关闭服务（可选）

## 📖 基类说明

### ServiceProvider.ts

所有服务提供者的基类：

```typescript
export abstract class ServiceProvider {
  protected app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  // 必须实现：注册服务
  public abstract register(): void;

  // 可选：启动服务
  public boot?(): Promise<void> | void;

  // 可选：关闭服务
  public shutdown?(): Promise<void> | void;

  // 延迟加载支持
  public provides(): string[] {
    return [];
  }
  public isDeferred(): boolean {
    return this.provides().length > 0;
  }
}
```

## 🔧 具体实现示例

### PluginServiceProvider.ts

插件系统的服务提供者：

```typescript
export class PluginServiceProvider extends ServiceProvider {
  public register(): void {
    // 注册插件仓储
    this.app.singleton('plugin.repository', () => {
      return new PluginRepository();
    });

    // 注册插件服务
    this.app.singleton('plugin.service', (container) => {
      const repository =
        container.resolve<PluginRepository>('plugin.repository');
      return new PluginService(repository);
    });

    // 设置别名
    this.app.container().alias('PluginService', 'plugin.service');
  }

  public async boot(): Promise<void> {
    const pluginService = this.app.make<PluginService>('plugin.service');
    await pluginService.initialize();
  }
}
```

## 📋 创建服务提供者

### 1. 继承基类

```typescript
import { ServiceProvider } from './ServiceProvider';

export class MyServiceProvider extends ServiceProvider {
  public register(): void {
    // 注册逻辑
  }
}
```

### 2. 注册服务

```typescript
public register(): void {
  // 注册单例服务
  this.app.singleton('my.service', () => {
    return new MyService();
  });

  // 注册瞬态服务
  this.app.bind('my.factory', () => {
    return new MyFactory();
  });

  // 注册带依赖的服务
  this.app.singleton('complex.service', (container) => {
    return new ComplexService(
      container.resolve('dependency1'),
      container.resolve('dependency2')
    );
  });

  // 设置别名
  this.app.container().alias('MyService', 'my.service');
}
```

### 3. 实现启动逻辑

```typescript
public async boot(): Promise<void> {
  const myService = this.app.make<MyService>('my.service');
  await myService.initialize();

  // 设置事件监听
  this.app.on('shutdown', () => {
    myService.cleanup();
  });
}
```

### 4. 延迟加载支持

```typescript
public provides(): string[] {
  return ['my.service', 'my.factory'];
}
```

## 🚀 使用指南

### 注册到应用

```typescript
import { MyServiceProvider } from '@/providers/MyServiceProvider';

// 在应用启动时注册
app.register(MyServiceProvider);
```

### 服务解析

```typescript
// 通过应用解析
const myService = app.make<MyService>('my.service');

// 通过容器解析
const myService = container.resolve<MyService>('my.service');

// 通过别名解析
const myService = container.resolve<MyService>('MyService');
```

## 📝 最佳实践

### 1. 单一职责

每个服务提供者应该只负责一个功能模块：

```typescript
// ✅ 好的做法
export class PluginServiceProvider extends ServiceProvider {
  // 只注册插件相关的服务
}

// ❌ 不好的做法
export class AllInOneServiceProvider extends ServiceProvider {
  // 注册所有服务
}
```

### 2. 明确依赖关系

```typescript
public register(): void {
  // ✅ 明确的依赖关系
  this.app.singleton('user.service', (container) => {
    return new UserService(
      container.resolve('user.repository'),
      container.resolve('event.service')
    );
  });
}
```

### 3. 资源清理

```typescript
public async shutdown(): Promise<void> {
  const service = this.app.make<MyService>('my.service');
  await service.cleanup();
}
```

### 4. 错误处理

```typescript
public async boot(): Promise<void> {
  try {
    const service = this.app.make<MyService>('my.service');
    await service.initialize();
  } catch (error) {
    console.error('Service boot failed:', error);
    throw error;
  }
}
```

## 🔄 与 Laravel 的对应关系

| 方法         | Laravel    | Buddy        | 说明             |
| ------------ | ---------- | ------------ | ---------------- |
| register()   | register() | register()   | 注册服务到容器   |
| boot()       | boot()     | boot()       | 启动服务         |
| provides()   | provides() | provides()   | 延迟加载服务列表 |
| isDeferred() | -          | isDeferred() | 是否为延迟提供者 |

## 🧪 测试支持

```typescript
describe('PluginServiceProvider', () => {
  let app: Application;
  let provider: PluginServiceProvider;

  beforeEach(() => {
    app = createTestApp();
    provider = new PluginServiceProvider(app);
  });

  it('should register plugin services', () => {
    provider.register();

    expect(app.container().bound('plugin.service')).toBe(true);
    expect(app.container().bound('plugin.repository')).toBe(true);
  });

  it('should boot plugin service', async () => {
    provider.register();
    await provider.boot();

    const service = app.make('plugin.service');
    expect(service).toBeInstanceOf(PluginService);
  });
});
```
