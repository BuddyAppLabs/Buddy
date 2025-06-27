# 🚀 Buddy 开发指南

## 依赖管理与构建系统

项目现在使用 **Turbo** + **PNPM Workspace** 来管理单体仓库的依赖关系。

### 📦 项目依赖关系

```
@coffic/cosy-framework (基础框架)
├── @coffic/cosy-logger (日志库)
├── @coffic/cosy-keyboard (键盘库)
└── buddy (主应用)

@coffic/buddy-types (类型定义)
├── buddy (主应用) 
└── 所有插件包
```

## 🔧 开发命令

### 主要开发模式

```bash
# 🎯 推荐：智能开发模式
# 启动 buddy 开发 + 依赖包自动重建
pnpm dev

# 📱 只开发 buddy（不监听依赖变更）
pnpm dev:buddy

# 🔧 只开发依赖包
pnpm dev:deps
```

### 构建命令

```bash
# 构建所有包
pnpm build

# 只构建依赖包
pnpm build:deps

# 只构建 buddy
pnpm build:buddy

# 构建插件
pnpm build:plugins
```

## 🎯 智能开发模式详解

当你运行 `pnpm dev` 时：

1. **初始构建** - 首先构建所有依赖包
2. **启动监听** - 并行启动两个进程：
   - 📁 **文件监听器**: 监听依赖包源码变更
   - 🚀 **Buddy 开发服务**: 启动主应用开发模式

3. **自动重建** - 当依赖包代码变更时：
   - 🔄 自动重新构建变更的依赖包
   - ⚡ 利用 Turbo 缓存，只重建必要的包
   - 🔗 Buddy 自动获取最新的依赖

### 监听的文件类型
- `packages/buddy-types/*.ts` - 类型定义文件
- `packages/cosy-*/src/**/*.{ts,js}` - 所有 cosy 包的源码

## 💡 开发技巧

### 1. 高效开发流程
```bash
# 一键启动完整开发环境
pnpm dev

# 在另一个终端窗口进行其他操作
pnpm lint    # 代码检查
pnpm test    # 运行测试
```

### 2. 依赖调试
如果怀疑依赖包有问题：
```bash
# 清理并重建所有依赖
pnpm clean
pnpm build:deps

# 然后重新启动开发模式
pnpm dev
```

### 3. 性能优化
- ✅ **Turbo 缓存**: 未变更的包会使用缓存，构建很快
- ✅ **增量构建**: 只重建变更的文件
- ✅ **并行处理**: 无依赖关系的包并行构建

## 🛠️ 故障排除

### 常见问题

1. **依赖包变更后 Buddy 没有更新**
   ```bash
   # 检查是否有构建错误
   pnpm build:deps
   
   # 重启开发环境
   # Ctrl+C 停止 pnpm dev，然后重新运行
   pnpm dev
   ```

2. **文件监听不工作**
   ```bash
   # 检查 nodemon 是否正确安装
   pnpm list nodemon
   
   # 手动测试监听
   npx nodemon --watch 'packages/buddy-types/*.ts' --ext ts --exec 'echo "File changed"'
   ```

3. **构建失败**
   ```bash
   # 查看详细错误信息
   pnpm build:deps --verbose
   
   # 清理缓存
   pnpm clean
   ```

## 🎉 总结

现在你有了一个强大的开发环境：
- 🚀 **一键启动**: `pnpm dev` 启动完整开发环境
- ⚡ **自动重建**: 依赖变更时自动重新构建
- 🔄 **智能缓存**: 极速增量构建
- 📦 **依赖管理**: 自动处理构建顺序

开始开发吧！🎯 