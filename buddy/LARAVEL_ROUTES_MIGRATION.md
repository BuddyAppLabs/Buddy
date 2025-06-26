# Laravel门面风格路由迁移完成

## 概述

成功将 `buddy/src/main/routes` 目录中的所有路由文件迁移为 Laravel 门面风格，使用 `@coffic/buddy-foundation` 包提供的 Route 门面。

## 迁移的文件

### 1. `actions.ts` - 插件动作路由
- 获取插件动作列表 (`GET_ACTIONS`)
- 执行插件动作 (`EXECUTE_PLUGIN_ACTION`)
- 获取动作视图 (`GET_ACTION_VIEW`)

### 2. `ai.ts` - AI功能路由
- 启动流式AI聊天会话 (`AI_CHAT_SEND`)
- 取消AI聊天请求 (`AI_CHAT_CANCEL`)

### 3. `common.ts` - 通用功能路由
- 打开文件夹 (`Open_Folder`)
- 创建视图 (`Create_View`)
- 销毁视图 (`Destroy_View`)
- 销毁所有插件视图 (`Destroy_Plugin_Views`)
- 更新视图边界 (`Update_View_Bounds`)
- 更新或插入视图 (`UPSERT_VIEW`)

### 4. `config.ts` - 配置管理路由
- 获取所有配置 (`CONFIG_GET_ALL`)
- 获取单个配置 (`CONFIG_GET`)
- 设置配置 (`CONFIG_SET`)
- 删除配置 (`CONFIG_DELETE`)
- 重置所有配置 (`CONFIG_RESET`)
- 获取配置文件路径 (`CONFIG_GET_PATH`)

### 5. `market.ts` - 插件市场路由
- 检查插件是否已安装 (`Plugin_Is_Installed`)
- 获取用户插件列表 (`GET_USER_PLUGINS`)
- 获取开发插件列表 (`GET_DEV_PLUGINS`)
- 获取远程插件列表 (`GET_REMOTE_PLUGINS`)
- 下载/安装插件 (`DOWNLOAD_PLUGIN`)
- 获取插件目录路径 (`GET_PLUGIN_DIRECTORIES`)
- 卸载插件 (`UNINSTALL_PLUGIN`)

### 6. `state.ts` - 应用状态路由
- 获取当前覆盖的应用 (`Get_Current_App`)

### 7. `update.ts` - 应用更新路由
- 检查更新 (`update:check`)

### 8. `index.ts` - 路由索引文件
- 移除了 router 分组相关代码
- 更新初始化消息为 "Laravel风格路由系统已初始化"

## 改动内容

### 代码结构变化
**之前的代码结构:**
```typescript
import { router, Route } from '@coffic/buddy-foundation';

router.group({
    name: 'actions',
    prefix: '',
    description: '插件动作管理'
}, (actionRouter) => {
    actionRouter.register(
        Route.handle(IPC_METHODS.GET_ACTIONS, async (event, keyword) => {
            // 处理逻辑
        }).description('描述')
    );
});
```

**现在的代码结构:**
```typescript
import { Route } from '@coffic/buddy-foundation';

Route.handle(IPC_METHODS.GET_ACTIONS, async (_event, keyword) => {
    // 处理逻辑
})
.validation({
    '0': { required: false, type: 'string' }
})
.description('描述');
```

### 主要优点

1. **简洁性**: 移除了冗余的分组代码，直接使用门面
2. **Laravel风格**: 使用静态方法调用，符合Laravel开发习惯
3. **链式调用**: 支持 `.validation()` 和 `.description()` 链式配置
4. **类型安全**: 保持完整的TypeScript类型支持
5. **自动注册**: 路由自动注册到全局路由器，无需手动管理

### 技术改进

1. **参数优化**: 将未使用的 `event` 参数改为 `_event` 消除TypeScript警告
2. **导入简化**: 只导入需要的 `Route` 门面，不再需要 `router` 实例
3. **代码一致性**: 所有路由文件使用相同的编码风格

## 验证结果

- ✅ TypeScript 类型检查通过
- ✅ 应用构建成功
- ✅ 所有原有功能保持不变
- ✅ 路由自动注册工作正常

## 注意事项

1. 所有路由功能保持不变，只是语法风格改为Laravel门面模式
2. 路由的IPC通道名称没有变化，确保前端兼容性
3. 中间件和验证功能继续可用
4. 路由描述用于调试和文档生成

这次迁移成功地将传统的路由组织方式升级为现代的Laravel门面风格，提高了代码的可读性和开发效率。 