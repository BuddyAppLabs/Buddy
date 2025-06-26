# Buddy Foundation 路由系统

基于 Laravel 设计理念的 Electron IPC 路由系统，提供优雅的路由注册、中间件支持和参数验证功能。

## 概述

本路由系统将 Electron 的 IPC 通信包装成类似 Laravel 的路由模式，使得开发者可以用更加直观和结构化的方式处理 IPC 请求。

## 核心特性

- 🚀 **链式 API**: 类似 Laravel 的流畅接口
- 🛡️ **中间件系统**: 支持认证、日志、频率限制等
- ✅ **参数验证**: 内置验证器，确保数据安全
- 📦 **路由分组**: 支持前缀和分组中间件
- 🔍 **类型安全**: 完整的 TypeScript 支持

## 快速开始

### 基本用法

```typescript
import { router, Route } from '@buddy-foundation/routing';

// 注册简单路由
router.register(
  Route.handle('user:get', async (event, userId) => {
    return { id: userId, name: 'John Doe' };
  })
);

// 初始化路由系统
router.initialize();
```

### 带验证的路由

```typescript
router.register(
  Route.post('user:create', async (event, userData) => {
    // 创建用户逻辑
    return { success: true, user: userData };
  })
  .validation({
    '0': { // 第一个参数
      required: true,
      type: 'object',
      validator: (data) => {
        return data.name && data.email ? true : '用户名和邮箱是必填的';
      }
    }
  })
  .description('创建新用户')
);
```

## 路由类型

系统提供了语义化的路由类型，类似 HTTP 方法：

```typescript
// GET 类型 - 用于查询操作
Route.get('users:list', getUsersHandler);

// POST 类型 - 用于创建操作
Route.post('users:create', createUserHandler);

// PUT 类型 - 用于更新操作
Route.put('users:update', updateUserHandler);

// DELETE 类型 - 用于删除操作
Route.delete('users:delete', deleteUserHandler);

// 通用类型
Route.handle('custom:action', customHandler);
```

## 中间件系统

### 内置中间件

#### 1. 日志中间件

```typescript
import { LoggingMiddleware } from '@buddy-foundation/routing';

router.register(
  Route.get('data:fetch', handler)
    .middleware(LoggingMiddleware({
      logLevel: 'info',
      includeArgs: true,
      includeResponse: false
    }))
);
```

#### 2. 频率限制中间件

```typescript
import { RateLimitMiddleware } from '@buddy-foundation/routing';

router.register(
  Route.post('api:call', handler)
    .middleware(RateLimitMiddleware({
      maxRequests: 10,
      windowMs: 60000, // 1分钟
      keyGenerator: (event) => `user:${event.sender.id}`
    }))
);
```

#### 3. 认证中间件

```typescript
import { AuthMiddleware, requirePermissions } from '@buddy-foundation/routing';

router.register(
  Route.delete('admin:delete', handler)
    .middleware(requirePermissions('admin', 'delete'))
);
```

### 自定义中间件

```typescript
const customMiddleware = async (event, next, ...args) => {
  console.log('请求前处理');
  
  try {
    const result = await next();
    console.log('请求后处理');
    return result;
  } catch (error) {
    console.error('请求错误处理');
    throw error;
  }
};

router.register(
  Route.handle('custom:action', handler)
    .middleware(customMiddleware)
);
```

### 全局中间件

```typescript
// 添加全局中间件，对所有路由生效
router.middleware(LoggingMiddleware());
```

## 路由分组

```typescript
// 创建路由分组
router.group({
  name: 'admin',
  prefix: 'admin',
  middleware: [AuthMiddleware({ permissions: ['admin'] })],
  description: '管理员操作分组'
}, (groupRouter) => {
  // 分组内的路由会自动添加前缀和中间件
  groupRouter.register(
    Route.get('users', getAllUsersHandler) // 实际通道: admin:get:users
  );
  
  groupRouter.register(
    Route.delete('user', deleteUserHandler) // 实际通道: admin:delete:user
  );
});
```

## 参数验证

### 基本验证规则

```typescript
Route.handle('user:update', handler)
  .validation({
    '0': { // 第一个参数：用户ID
      required: true,
      type: 'string'
    },
    '1': { // 第二个参数：用户数据
      required: true,
      type: 'object',
      validator: (data) => {
        if (!data.email || !data.email.includes('@')) {
          return '无效的邮箱地址';
        }
        return true;
      }
    }
  })
```

### 验证规则选项

- `required`: 是否必填
- `type`: 参数类型 (`'string' | 'number' | 'boolean' | 'object' | 'array'`)
- `validator`: 自定义验证函数

### 自定义验证器

```typescript
const emailValidator = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) || '无效的邮箱格式';
};

Route.post('auth:register', handler)
  .validation({
    '0': {
      required: true,
      type: 'object',
      validator: (data) => {
        return emailValidator(data.email);
      }
    }
  })
```

## 错误处理

路由系统提供了统一的错误处理机制：

```typescript
Route.handle('risky:operation', async (event, data) => {
  try {
    // 业务逻辑
    return await performOperation(data);
  } catch (error) {
    // 错误会被自动捕获并记录
    throw new Error(`操作失败: ${error.message}`);
  }
})
```

## 高级用法

### 获取认证上下文

在使用认证中间件后，可以在处理器中访问认证上下文：

```typescript
Route.get('user:profile', async (event) => {
  const authContext = (event as any).authContext;
  console.log('用户权限:', authContext.permissions);
  
  return { 
    userId: authContext.webContentsId,
    permissions: authContext.permissions 
  };
}).middleware(AuthMiddleware());
```

### 动态路由注册

```typescript
// 在运行时动态添加路由
const dynamicRoutes = [
  Route.get('plugin:action1', handler1),
  Route.get('plugin:action2', handler2)
];

router.registerRoutes(dynamicRoutes);
```

### 路由信息查询

```typescript
// 获取所有已注册的路由
const routes = router.getRoutes();
console.log('已注册路由:', Array.from(routes.keys()));

// 获取所有路由分组
const groups = router.getGroups();
console.log('路由分组:', Array.from(groups.keys()));
```

## 最佳实践

1. **路由命名**: 使用命名空间和动作的组合，如 `user:create`, `file:upload`
2. **中间件顺序**: 认证中间件应该在业务中间件之前
3. **参数验证**: 对所有外部输入进行验证
4. **错误处理**: 使用描述性的错误消息
5. **分组使用**: 相关功能使用路由分组管理

## 示例应用

```typescript
import { router, Route, LoggingMiddleware, AuthMiddleware } from '@buddy-foundation/routing';

// 全局中间件
router.middleware(LoggingMiddleware());

// 公开路由
router.register(
  Route.get('system:version', async () => {
    return { version: '1.0.0' };
  }).description('获取系统版本')
);

// 用户路由分组
router.group({
  name: 'user',
  prefix: 'user',
  middleware: [AuthMiddleware()],
  description: '用户相关操作'
}, (userRouter) => {
  userRouter.register(
    Route.get('profile', async (event) => {
      const authContext = (event as any).authContext;
      return { id: authContext.webContentsId };
    }).description('获取用户资料')
  );
  
  userRouter.register(
    Route.post('update', async (event, userData) => {
      // 更新用户逻辑
      return { success: true };
    })
    .validation({
      '0': {
        required: true,
        type: 'object',
        validator: (data) => data.name ? true : '用户名是必填的'
      }
    })
    .description('更新用户资料')
  );
});

// 初始化路由系统
router.initialize();
```

## API 参考

### Route 类

- `Route.handle(channel, handler)`: 创建通用路由
- `Route.get(channel, handler)`: 创建 GET 类型路由
- `Route.post(channel, handler)`: 创建 POST 类型路由
- `Route.put(channel, handler)`: 创建 PUT 类型路由
- `Route.delete(channel, handler)`: 创建 DELETE 类型路由
- `.middleware(...middleware)`: 添加中间件
- `.validation(rules)`: 设置验证规则
- `.description(desc)`: 设置路由描述
- `.group(name)`: 设置路由分组

### Router 类

- `register(route)`: 注册单个路由
- `registerRoutes(routes)`: 批量注册路由
- `group(config, callback)`: 创建路由分组
- `middleware(middleware)`: 添加全局中间件
- `initialize()`: 初始化路由系统
- `getRoutes()`: 获取所有路由
- `getGroups()`: 获取所有分组
- `clear()`: 清空路由（测试用）

### 内置中间件

- `LoggingMiddleware(options)`: 日志中间件
- `RateLimitMiddleware(options)`: 频率限制中间件
- `AuthMiddleware(options)`: 认证中间件
- `requirePermissions(...permissions)`: 权限检查中间件
- `optionalAuth()`: 可选认证中间件 