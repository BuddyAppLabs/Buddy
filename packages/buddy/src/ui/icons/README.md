# 图标组件目录

所有 SVG 图标统一放在此目录下，作为 Vue 组件使用。

## 使用方法

### 1. 导入图标

```vue
<script setup lang="ts">
  import { SettingsIcon, AIIcon } from '@/ui/icons';
</script>
```

### 2. 在模板中使用

```vue
<template>
  <SettingsIcon class="w-6 h-6" />
  <AIIcon class="w-5 h-5 text-primary" />
</template>
```

## 图标组件规范

### 文件命名

- 使用 PascalCase 命名，如 `SettingsIcon.vue`
- 文件名应清晰描述图标用途

### 组件结构

```vue
<!--
 * IconName.vue - 图标描述
 * 
 * 提供xxx图标
 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="..." />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    class?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    class: '',
  });
</script>
```

### Props

- `class`: 可选的 CSS 类名，用于控制图标大小、颜色等样式

### 样式控制

- 使用 `class` prop 传入 Tailwind CSS 类名
- 常用类名：
  - 大小：`w-4 h-4`, `w-5 h-5`, `w-6 h-6`
  - 颜色：`text-primary`, `text-error`, `text-base-content`

## 现有图标

- `StoreIcon` - 商店图标
- `SettingsIcon` - 设置图标
- `AIIcon` - AI/星星图标
- `KeyboardIcon` - 键盘/快捷键图标
- `InfoIcon` - 信息/关于图标
- `EyeIcon` - 显示密码图标
- `EyeOffIcon` - 隐藏密码图标
- `CheckIcon` - 勾选/确认图标

## 添加新图标

1. 在此目录创建新的 `.vue` 文件
2. 按照上述规范编写组件
3. 在 `index.ts` 中导出新图标
4. 更新此 README 的图标列表
