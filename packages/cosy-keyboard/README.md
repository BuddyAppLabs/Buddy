# @coffic/cosy-keyboard

`@coffic/cosy-keyboard` 是一个为 `@coffic/cosy-framework` 设计的键盘服务提供者。它负责在 `macOS` 平台下监听特定的快捷键（默认为 `Option` 键或 `Command` 键的双击），并在触发时发布一个全局事件。

## 设计理念

本包遵循事件驱动的设计模式。它自身不执行任何具体业务逻辑，仅在检测到按键事件时，通过 `cosy-framework` 的应用实例 (`app`) 发布一个事件。应用的其他部分可以订阅此事件来执行相应的操作，从而实现模块间的完全解耦。

## 安装与注册

要使用此服务，您需要在您的主应用中注册 `KeyboardServiceProvider`。

**示例**: 在您的应用引导文件中 (例如: `src/main/bootstrap/app.ts`)

```typescript
import { KeyboardServiceProvider } from '@coffic/cosy-keyboard';
import { Application } from '@coffic/cosy-framework';

// ...

export const app = Application.create({
  // ...
  providers: [
    // ... 其他服务提供者
    KeyboardServiceProvider,
  ],
});
```

## 使用方法

`KeyboardServiceProvider` 在启动后会自动开始监听快捷键。当快捷键被触发时（例如，双击 `Option` 键），它会发布一个名为 `hotkey:triggered` 的事件。

您可以在应用中的任何位置（通常是在另一个服务提供者的 `boot` 方法中）监听此事件。

```typescript
// 在某个 ServiceProvider 的 boot 方法中
public async boot(): Promise<void> {
  this.app.on('hotkey:triggered', () => {
    console.log('快捷键被触发了！');
    // 在这里执行你的逻辑，例如：
    // windowManager.toggleMainWindow();
  });
}
```

## 自定义配置

默认情况下，包会监听以下按键：

- **开发环境**: 双击 `Option` (keycodes: `[58, 61]`)
- **生产环境**: 双击 `Command` (keycodes: `[54, 55]`)

您可以轻松地覆盖这个默认配置。只需在您的主应用配置目录下 (例如: `config/`) 创建一个 `keyboard.ts` 文件。

**文件路径**: `your-app/config/keyboard.ts`

```typescript
import { KeyboardConfig } from '@coffic/cosy-keyboard';

const config: KeyboardConfig = {
  hotkey: {
    // 开发环境: 监听左侧 Shift (keycode: 56)
    development: [56],
    // 生产环境: 监听右侧 Command (keycode: 54)
    production: [54],
  },
};

export default config;
```

服务提供者会自动检测并加载此配置文件。如果文件不存在，它将回退到默认配置。`KeyboardConfig` 类型确保了您的配置是类型安全的，任何拼写或类型错误都会在编译时被捕获。
