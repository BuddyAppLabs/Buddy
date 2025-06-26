# Buddy Foundation 路由系统使用示例

本文档展示如何在 Buddy 项目中使用新的路由系统来替代原有的 RouterService。

## 迁移指南

### 原有代码 (RouterService)

```typescript
// 原有的RouterService方式
class RouterService {
  private routes = new Map();
  
  register(channel: string, handler: Function) {
    this.routes.set(channel, handler);
    ipcMain.handle(channel, handler);
  }
}
```

### 新的路由系统

```typescript
// 新的路由系统方式
import { router, Route, LoggingMiddleware, AuthMiddleware } from '@buddy-foundation/routing';

// 更优雅、更强大的路由注册
router.register(
  Route.handle('window:create', createWindowHandler)
    .middleware(LoggingMiddleware())
    .validation({
      '0': { required: true, type: 'object' }
    })
    .description('创建新窗口')
);
```

## 主进程中的初始化

```typescript
// main/index.ts
import { router } from '@buddy-foundation/routing';

// 导入所有路由模块
import './routes/window';
import './routes/file';
import './routes/app';
import './routes/plugin';

// 初始化路由系统
router.initialize();

console.log('路由系统已初始化，注册的路由数量:', router.getRoutes().size);
```

## 渲染进程中的使用

```typescript
// renderer/services/ipc.ts
import { ipcRenderer } from 'electron';

export class IpcService {
  // 创建窗口
  static async createWindow(options: any) {
    return await ipcRenderer.invoke('window:post:create', options);
  }

  // 读取文件
  static async readFile(filePath: string) {
    return await ipcRenderer.invoke('file:get:read', filePath);
  }

  // 获取应用信息
  static async getAppInfo() {
    return await ipcRenderer.invoke('app:get:info');
  }
}
```

## 迁移清单

- [ ] 将现有的 RouterService 调用替换为新的路由系统
- [ ] 添加适当的中间件（日志、认证等）
- [ ] 为所有路由添加参数验证
- [ ] 使用路由分组组织相关功能
- [ ] 更新渲染进程中的IPC调用
- [ ] 添加错误处理逻辑
- [ ] 编写单元测试
- [ ] 更新文档和类型定义 