# 路由空白页面问题修复

## 问题描述

在快速连续切换路由时，页面内容区域会变成空白，但路由导航本身是成功的（标题会更新）。

## 根本原因

Vue 的 `<Transition>` 组件在快速连续导航时会进入不稳定状态：

```vue
<!-- ❌ 有问题的代码 -->
<router-view v-slot="{ Component, route }">
  <transition name="fade" mode="out-in">
    <component :is="Component" :key="route.path" />
  </transition>
</router-view>
```

### 问题表现

1. 前几次导航正常，transition 钩子都会触发
2. 快速连续导航后，transition 钩子不再触发
3. 组件无法正常渲染，导致空白页面

### 调试日志显示

```
✅ 正常导航:
[Router] 导航完成
[App] Transition: before-enter
[App] Transition: after-leave

❌ 问题导航:
[Router] 导航完成
(没有 transition 钩子触发)
```

## 解决方案

### 方案 1：移除 Transition（当前采用）

完全移除 `<Transition>` 组件，使用简单的 CSS 动画：

```vue
<router-view v-slot="{ Component, route }">
  <div class="route-view-wrapper">
    <component :is="Component" :key="route.path" v-if="Component" />
  </div>
</router-view>

<style>
.route-view-wrapper {
  animation: fadeIn 0.15s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
```

**优点：**
- 稳定可靠，不会出现状态混乱
- 性能更好
- 代码更简单

**缺点：**
- 只有进入动画，没有离开动画
- 动画效果相对简单

### 方案 2：使用 KeepAlive（备选）

如果需要缓存组件状态：

```vue
<router-view v-slot="{ Component, route }">
  <keep-alive :max="5">
    <component :is="Component" :key="route.path" />
  </keep-alive>
</router-view>
```

### 方案 3：使用 Suspense（备选）

如果组件有异步操作：

```vue
<router-view v-slot="{ Component, route }">
  <Suspense>
    <component :is="Component" :key="route.path" />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</router-view>
```

## 其他修复

### 1. 添加了 PluginsLayout 组件

```vue
<!-- packages/buddy/src/ui/views/PluginsLayout.vue -->
<template>
  <router-view />
</template>
```

**原因：** `/plugins` 路由有子路由，需要一个父组件来渲染 `<router-view>`

### 2. 确保路由配置正确

```typescript
{
  path: '/plugins',
  component: PluginsLayout,  // ✅ 必须有 component
  children: [...]
}
```

### 3. 添加了 key 属性

```vue
<component :is="Component" :key="route.path" />
```

**作用：** 确保路由变化时组件完全重新挂载，避免组件复用导致的状态问题

### 4. 添加了 v-if 检查

```vue
<component :is="Component" :key="route.path" v-if="Component" />
```

**作用：** 确保组件存在才渲染，避免渲染 undefined

## 最佳实践

### 1. 避免在路由切换中使用复杂的 Transition

- 简单的 CSS 动画更稳定
- 如果需要复杂动画，考虑在组件内部实现

### 2. 使用 key 属性

- 确保路由变化时组件重新挂载
- 避免组件复用导致的状态问题

### 3. 嵌套路由必须有父组件

- 有 children 的路由必须指定 component
- 父组件需要包含 `<router-view />`

### 4. 添加错误处理

```typescript
router.onError((error) => {
  console.error('[Router] 路由错误:', error);
});
```

## 测试建议

1. **快速连续导航测试**
   - 快速点击多个导航按钮
   - 确保每次都能正常渲染

2. **不同路由类型测试**
   - 顶级路由（如 `/settings`）
   - 嵌套路由（如 `/plugins/user`）
   - 带参数的路由

3. **浏览器兼容性测试**
   - Chrome
   - Safari
   - Firefox

## 相关文件

- `packages/buddy/src/ui/layout/App.vue` - 主应用布局
- `packages/buddy/src/ui/router.ts` - 路由配置
- `packages/buddy/src/ui/views/PluginsLayout.vue` - 插件布局组件
- `packages/buddy/src/ui/composables/useNavigation.ts` - 导航函数

## 参考资料

- [Vue Router - Transitions](https://router.vuejs.org/guide/advanced/transitions.html)
- [Vue - Transition Component](https://vuejs.org/guide/built-ins/transition.html)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
