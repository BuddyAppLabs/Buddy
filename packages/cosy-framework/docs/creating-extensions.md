# 扩展开发指南

本文档将指导您如何为 `@coffic/cosy-framework` 创建一个功能完善、可复用的扩展。我们将以开发一个键盘快捷键扩展为例，讲解其中的核心概念和最佳实践。

在 `cosy-framework` 的生态中，一个"扩展"（也常被称为"包"或"插件"）是一个独立的 npm 包，它通过一个或多个 `服务提供者 (ServiceProvider)` 来向主应用注册功能。

## 核心设计理念

一个优秀的扩展应该遵循以下原则：

1.  **解耦**: 扩展的核心逻辑应尽可能独立，不依赖于任何特定的应用。它应该通过发布事件或提供通用接口来与外部通信，而不是直接调用具体应用的业务代码。
2.  **可配置**: 扩展应提供一套合理的默认配置，但同时允许使用者通过配置文件轻松地覆盖这些默认值。
3.  **单一职责**: 每个扩展都应聚焦于解决一个特定的问题。
4.  **文档清晰**: 每个扩展都应有自己的 `README.md`，清楚地说明其功能、安装和使用方法。

## 开发步骤：以键盘扩展为例

### 第1步：项目结构

为你的扩展创建一个新的 npm 项目。典型的结构如下：

```
my-keyboard-extension/
├── src/
│   ├── contracts/      # (可选) 定义接口契约
│   ├── facades/        # (可选) 定义门面
│   ├── types.ts        # 定义公开的 TypeScript 类型
│   ├── KeyManager.ts   # 核心逻辑实现
│   ├── KeyboardServiceProvider.ts # 服务提供者
│   └── index.ts        # 包的主入口
├── package.json
├── tsconfig.json
└── README.md
```

### 第2步：编写核心逻辑

在 `KeyManager.ts` 中，我们编写一个普通的 TypeScript 类。注意，在这一步，它**不依赖于框架的任何部分**。它接收完成其工作所需的所有依赖项（比如 `app` 实例和按键配置）作为构造函数参数。

```typescript
// src/KeyManager.ts
import { Application } from '@coffic/cosy-framework';

export class KeyManager {
  constructor(
    private app: Application,
    private keycodesToMonitor: number[]
  ) {}

  public async setupKeyListener(): Promise<void> {
    // ... 监听键盘的逻辑 ...

    // 当事件发生时，通过 app 实例发布事件
    if (/* a double press is detected */) {
      this.app.emit('hotkey:triggered');
    }
  }
}
```

### 第3步：创建服务提供者

服务提供者是连接你的扩展和 `cosy-framework` 的桥梁。

```typescript
// src/KeyboardServiceProvider.ts
import { ServiceProvider, Config } from '@coffic/cosy-framework';
import { KeyManager } from './KeyManager.js';
import { KeyboardConfig } from './types.js';

export class KeyboardServiceProvider extends ServiceProvider {
  public register(): void {
    this.app.singleton('keyboard', () => {
      // 1. 读取用户配置，并提供默认值
      const config = Config.get<KeyboardConfig>('keyboard', {
        hotkey: {
          development: [58, 61], // macOS Option
          production: [54, 55], // macOS Command
        },
      });

      // 2. 根据环境选择配置
      const keycodes = this.app.isDevelopment()
        ? config.hotkey.development
        : config.hotkey.production;

      // 3. 实例化核心类，并注入依赖
      return new KeyManager(this.app, keycodes);
    });

    this.app.container().alias('KeyboardManager', 'keyboard');
  }

  public async boot(): Promise<void> {
    const keyboardManager = this.app.make<KeyManager>('keyboard');
    await keyboardManager.setupKeyListener();
  }
}
```

### 第4步：提供类型定义和配置文件

为了让使用者能够以类型安全的方式覆盖配置，我们需要：

1.  在扩展内部定义配置的 `interface`。
2.  从扩展的主入口导出这个类型。

```typescript
// src/types.ts
export interface HotkeyConfig {
  development: number[];
  production: number[];
}

export interface KeyboardConfig {
  hotkey: HotkeyConfig;
}
```

```typescript
// src/index.ts
export * from './KeyboardServiceProvider.js';
export * from './types.js'; // 导出类型
// ...
```

### 第5步：指导使用者

最后，在扩展的 `README.md` 中，清楚地告诉使用者如何：

1.  在他们的主应用中注册你的 `ServiceProvider`。
2.  在他们的 `config/` 目录下创建 `keyboard.ts` 配置文件来覆盖默认行为。
3.  监听你的扩展发布的事件 (`hotkey:triggered`)。

## 总结

遵循以上步骤，你就可以创建一个与框架深度集成、同时又保持高度独立和可配置性的高质量扩展。这种模式是 `cosy-framework` 生态系统的基础，鼓励代码复用和社区协作。
