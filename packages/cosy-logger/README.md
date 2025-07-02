# Cosy Logger

Cosy Logger 是一个为 Electron 应用程序设计的灵活且可扩展的日志框架。它的设计灵感来自 Laravel 的日志系统，基于 `electron-log` 构建，通过服务提供者、通道和驱动程序提供结构化的日志管理方式。

## 特性

- **服务提供者集成**：与 `cosy-framework` 服务容器无缝集成
- **多通道日志**：支持配置多个日志通道（如 `app`、`error`、`plugin`），每个通道可以有不同的设置
- **基于驱动的架构**：易于扩展自定义日志驱动
- **文件日志**：在生产环境中将日志持久化到文件系统
- **控制台日志**：在开发过程中提供彩色格式化的控制台输出
- **可配置性**：支持通过应用程序配置文件自定义日志行为

## 安装

```bash
pnpm add @coffic/cosy-logger
```

## 基本使用

```typescript
import { Log } from '@coffic/cosy-logger';

// 使用默认通道记录日志
Log.info('这是一条信息日志');
Log.error('发生了一个错误', { error: new Error('错误详情') });

// 使用特定通道记录日志
Log.channel('plugin').info('插件已启动');
Log.channel('security').warn('检测到可疑活动');
```

## 配置

### 默认配置

Cosy Logger 提供了一套默认配置，包括常用的日志通道和设置。默认配置包括：

```typescript
{
  default: 'app',  // 默认通道
  channels: {
    app: {
      driver: 'electron',
      level: 'info',
      format: 'structured',
      includeTimestamp: false
    },
    error: {
      driver: 'electron',
      level: 'error',
      format: 'json'
    },
    plugin: {
      driver: 'electron',
      level: 'info',
      format: 'structured',
      includeTimestamp: false
    }
    // ... 其他预配置通道
  }
}
```

### 自定义配置

你可以通过应用程序的配置系统自定义日志行为。在你的应用配置文件中添加 `logger` 配置：

```typescript
// config/logger.ts
export default {
  default: 'app', // 修改默认通道
  channels: {
    app: {
      driver: 'electron',
      level: 'debug', // 覆盖默认级别
      format: 'json', // 修改输出格式
      includeTimestamp: true, // 添加时间戳
    },
    customChannel: {
      // 添加新的通道
      driver: 'electron',
      level: 'info',
      format: 'simple',
    },
  },
};
```

配置选项说明：

- **default**: 设置默认的日志通道
- **channels**: 定义日志通道配置
  - **driver**: 日志驱动类型（目前支持 'electron' 和 'stack'）
  - **level**: 日志级别（'debug', 'info', 'warn', 'error'）
  - **format**: 输出格式（'simple', 'structured', 'json'）
  - **includeTimestamp**: 是否包含时间戳
  - **channels**: （仅用于 stack 驱动）要组合的通道列表

### 类型支持

为了确保类型安全，我们提供了 `LoggerConfig` 接口：

```typescript
import { LoggerConfig } from '@coffic/cosy-logger';

const config: LoggerConfig = {
  default: 'app',
  channels: {
    // ... 你的通道配置
  },
};
```

## 日志文件位置

在生产环境中，日志不仅会输出到控制台，还会写入到用户系统的文件中。日志文件存储在每个操作系统的标准应用程序日志目录中：

- **macOS**: `~/Library/Logs/{appName}/`
- **Windows**: `%USERPROFILE%\AppData\Roaming\{appName}\logs\`
- **Linux**: `~/.config/{appName}/logs/`

### 在应用程序中访问日志

你可以使用 Electron 的 `shell` 模块在应用程序中打开日志目录：

```typescript
import { app, shell } from 'electron';

const logsPath = app.getPath('logs');
shell.openPath(logsPath);
```

## 高级用法

### 使用 Stack 驱动

Stack 驱动允许你将多个日志通道组合在一起：

```typescript
{
  channels: {
    production: {
      driver: 'stack',
      channels: ['app', 'error']  // 同时写入到 app 和 error 通道
    }
  }
}
```

### 添加自定义驱动

你可以通过 `LogManager` 的 `extend` 方法添加自定义驱动：

```typescript
const manager = app.make<LogManagerContract>('log.manager');

manager.extend('custom-file', (config) => {
  // 返回你的自定义日志通道实现
  return {
    log: (level, message, context) => {
      // 实现你的日志记录逻辑
    },
  };
});
```

## 最佳实践

1. **使用适当的日志级别**：

   - DEBUG: 详细的调试信息
   - INFO: 常规操作信息
   - WARN: 需要注意但不影响系统运行的问题
   - ERROR: 错误和异常情况

2. **结构化日志**：

   - 使用 context 对象传递结构化数据
   - 避免在消息中拼接变量

3. **通道分类**：

   - 根据功能模块划分日志通道
   - 使用专门的错误通道记录异常

4. **生产环境配置**：
   - 调整日志级别以减少磁盘使用
   - 考虑使用 JSON 格式便于日志分析
   - 启用时间戳以便追踪问题

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 禁用日志通道

为了方便关闭某个日志通道，用户可以在日志配置文件中将对应通道的 `driver` 值设置为 `null`。当 `driver` 设置为 `null` 时，该日志通道将被禁用，所有与该通道相关的日志调用都不会产生任何输出。

这种方式为在不同环境（例如生产环境）下灵活控制日志记录提供了一种简单直观的手段，而无需修改代码，只需调整配置即可。
