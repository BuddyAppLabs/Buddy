# 设置组件目录

设置页面的所有子组件都放在这个目录下，按照功能分类拆分。

## 组件结构

```
settings/
├── SettingsSidebar.vue      # 左侧分类导航
├── GeneralSettings.vue       # 通用设置
├── AISettings.vue            # AI设置
├── ShortcutsSettings.vue     # 快捷键设置
├── AboutSettings.vue         # 关于设置
├── index.ts                  # 统一导出
└── README.md                 # 说明文档
```

## 组件说明

### SettingsSidebar.vue

左侧分类导航组件，负责显示设置分类列表和切换分类。

**Props:**

- `activeCategory: string` - 当前激活的分类 ID
- `categories: SettingCategory[]` - 分类列表

**Events:**

- `select(categoryId: string)` - 选择分类时触发

### GeneralSettings.vue

通用设置组件，包含：

- 主题选择
- 语言选择
- 自动更新开关
- 开机启动开关

### AISettings.vue

AI 设置组件，包含：

- AI 供应商列表（OpenAI、DeepSeek、Anthropic 等）
- API 密钥输入和管理
- 密钥测试功能
- 支持的模型列表

### ShortcutsSettings.vue

快捷键设置组件，包含：

- 全局快捷键配置

### AboutSettings.vue

关于设置组件，包含：

- 应用版本信息
- 检查更新功能

## 使用方法

在 `SettingsView.vue` 中使用：

```vue
<script setup lang="ts">
  import {
    SettingsSidebar,
    GeneralSettings,
    AISettings,
    ShortcutsSettings,
    AboutSettings,
  } from '@/ui/components/settings';
</script>

<template>
  <SettingsSidebar ... />
  <GeneralSettings v-if="activeCategory === 'general'" />
  <AISettings v-else-if="activeCategory === 'ai'" />
  <!-- ... -->
</template>
```

## 添加新的设置分类

1. 在 `settings/` 目录创建新的组件文件，如 `PluginSettings.vue`
2. 在 `index.ts` 中导出新组件
3. 在 `SettingsView.vue` 中：
   - 添加新分类到 `categories` 数组
   - 在模板中添加对应的条件渲染
4. 在 `SettingsSidebar.vue` 的 `getCategoryIcon` 方法中添加图标映射

## 设计原则

- **单一职责**：每个组件只负责一个设置分类
- **独立性**：组件之间相互独立，不共享状态
- **可复用**：组件设计考虑复用性，便于维护
- **懒加载**：AI 设置等复杂组件只在需要时加载数据
