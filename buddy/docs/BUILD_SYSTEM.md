# 🚀 Buddy 项目构建系统

Buddy 项目现在使用现代化的构建系统，结合了 **Turbo** 和 **PNPM Workspace** 来管理单体仓库的依赖关系和构建流程。

## 📦 项目依赖图

```
@coffic/cosy-framework ← @coffic/cosy-framework ← @coffic/cosy-keyboard
                     ↘
@coffic/buddy-types ← buddy (主应用)
                 ↘
                   所有插件包
```

## 🔧 可用的构建命令

### 基础构建命令

```bash
# 构建所有包（智能依赖顺序）
pnpm build

# 只构建核心依赖包
pnpm build:deps

# 只构建主应用
pnpm build:buddy

# 构建所有插件
pnpm build:plugins

# 构建 macOS 版本（包含依赖）
pnpm build:buddy:mac
```

### 开发模式命令

```bash
# 启动开发环境（并行模式）
pnpm dev

# 只启动依赖包的 watch 模式
pnpm dev:deps

# 只启动主应用开发模式
pnpm dev:buddy

# 智能开发模式（先启动依赖，再启动主应用）
pnpm dev:watch
```

### 智能构建脚本

```bash
# 使用智能构建脚本
pnpm smart:build    # 智能构建所有包
pnpm smart:dev      # 智能并行开发模式
pnpm smart:deps     # 只构建依赖包

# 直接使用脚本（更多选项）
node scripts/smart-build.mjs build           # 构建所有
node scripts/smart-build.mjs build buddy     # 构建指定包
node scripts/smart-build.mjs dev-parallel    # 并行开发模式
```

### 其他实用命令

```bash
# 代码检查
pnpm lint

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 清理构建产物
pnpm clean
```

## 🎯 推荐工作流

### 首次构建

```bash
# 1. 安装依赖
pnpm install

# 2. 构建所有依赖包
pnpm smart:deps

# 3. 启动开发环境
pnpm smart:dev
```

### 日常开发

```bash
# 启动智能开发模式（推荐）
pnpm smart:dev
```

这会：

1. 🔧 启动所有依赖包的 watch 模式
2. ⏳ 等待依赖包构建完成
3. 🎯 启动主应用开发服务器

### 生产构建

```bash
# 构建所有包
pnpm build

# 或者分步构建
pnpm smart:deps     # 先构建依赖
pnpm build:buddy    # 再构建主应用
```

## ⚡ 性能优化特性

### Turbo 缓存

- **智能缓存**: 只重建变更的包
- **并行构建**: 无依赖的包并行构建
- **增量构建**: 基于文件变更的增量构建

### 依赖管理

- **自动依赖解析**: 自动计算构建顺序
- **循环依赖检测**: 防止循环依赖问题
- **智能过滤**: 只构建需要的包

## 🔍 故障排除

### 构建失败

```bash
# 清理所有构建产物
pnpm clean

# 重新构建依赖
pnpm smart:deps

# 查看构建计划（不执行）
pnpm exec turbo run build --dry
```

### 依赖问题

```bash
# 重新安装依赖
rm -rf node_modules
pnpm install

# 重新构建类型定义
pnpm --filter @coffic/buddy-types build
```

### 开发环境问题

```bash
# 停止所有进程，重新启动
# Ctrl+C 停止当前进程

# 重新启动开发环境
pnpm smart:dev
```

## 📊 监控构建性能

```bash
# 查看构建时间统计
pnpm exec turbo run build --summarize

# 生成构建图
pnpm exec turbo run build --graph
```

## 🛠 自定义配置

### 修改 Turbo 配置

编辑 `turbo.json` 来调整构建配置：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "out/**"],
      "inputs": ["src/**", "*.ts", "package.json"]
    }
  }
}
```

### 修改依赖图

编辑 `scripts/smart-build.mjs` 中的 `DEPENDENCY_GRAPH` 来调整依赖关系。

## 🎉 优势总结

1. **🚀 更快的构建速度**: 智能缓存和并行构建
2. **🔧 简化的开发流程**: 一个命令启动所有服务
3. **📦 自动依赖管理**: 无需手动管理构建顺序
4. **🛡️ 错误预防**: 循环依赖检测和类型安全
5. **📊 可视化**: 构建图和性能统计

现在你可以更加高效地开发 Buddy 项目了！🎯
