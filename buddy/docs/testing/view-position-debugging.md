# 视图位置调试指南

## 🎯 **问题描述**

修复子视图在主视图滚动时可能覆盖状态栏的问题。

## 📐 **布局结构分析**

### Electron窗口布局（从上到下）
```
┌─────────────────────────────────────┐
│ 搜索栏 (56px)                       │ ← searchBarHeight
├─────────────────────────────────────┤
│                                     │
│ 内容区域 (可滚动)                   │ ← 插件视图应该在这里
│                                     │
├─────────────────────────────────────┤
│ 状态栏 (40px)                       │ ← statusBarHeight
└─────────────────────────────────────┘
```

### 关键参数
- **搜索栏高度**: 56px (h-10 + mt-4 + padding)
- **状态栏高度**: 40px (h-10)
- **可用内容高度**: `windowHeight - 56 - 40`

## 🔍 **调试方法**

### 1. 打开开发者工具
```javascript
// 在渲染进程控制台中执行
console.log('窗口信息:', {
    windowHeight: window.innerHeight,
    searchBarHeight: 56,
    statusBarHeight: 40,
    availableHeight: window.innerHeight - 56 - 40
})
```

### 2. 监听滚动事件
```javascript
// 监听内容滚动
document.addEventListener('content-scroll', (e) => {
    console.log('滚动事件:', e.detail)
})
```

### 3. 检查视图位置计算
打开浏览器控制台，查看 `ViewLayoutManager` 的日志输出：

```
ViewLayoutManager: 计划更新视图 /path/to/plugin.html: {
  viewport: { x: 48, y: 224, w: 384, h: 224 },
  scroll: { x: 0, y: 100 },
  absolute: { x: 48, y: 380 },
  layout: { 
    searchBarHeight: 56, 
    statusBarHeight: 40, 
    windowHeight: 600, 
    availableContentHeight: 504,
    maxAllowedBottom: 560 
  },
  adjusted: { x: 48, y: 380, width: 384, height: 180 }
}
```

## ✅ **验证要点**

### 1. **视图不覆盖状态栏**
- `adjusted.y + adjusted.height ≤ maxAllowedBottom`
- `maxAllowedBottom = searchBarHeight + availableContentHeight`

### 2. **视图不超出搜索栏上方**
- `adjusted.y ≥ searchBarHeight`

### 3. **滚动时位置正确更新**
- 向下滚动时，视图的Y坐标应该相应调整
- 视图高度应该被裁剪以避免覆盖状态栏

### 4. **主进程验证**
在主进程日志中查看：
```
[ViewManager] 视图边界已设置: { x: 48, y: 380, width: 384, height: 180 }
```

## 🐛 **常见问题排查**

### 问题1: 视图仍然覆盖状态栏
**可能原因**:
- 坐标计算错误
- 状态栏高度配置不正确
- 主进程验证逻辑错误

**排查方法**:
```javascript
// 检查实际的状态栏元素高度
const statusBar = document.querySelector('.h-10.z-50')
console.log('实际状态栏高度:', statusBar?.offsetHeight)
```

### 问题2: 滚动时视图位置不更新
**可能原因**:
- 滚动事件未正确监听
- 滚动容器选择器错误

**排查方法**:
```javascript
// 检查滚动容器
const contentElement = document.querySelector('.flex-1.overflow-auto')
console.log('滚动容器:', contentElement)
console.log('滚动位置:', contentElement?.scrollTop)
```

### 问题3: 视图被过度裁剪
**可能原因**:
- `searchBarHeight` 计算不准确
- 边界验证过于严格

**排查方法**:
```javascript
// 检查搜索栏实际高度
const searchBar = document.querySelector('.h-10.mt-4.px-4')
const searchBarRect = searchBar?.getBoundingClientRect()
console.log('搜索栏位置和大小:', searchBarRect)
```

## 📋 **测试清单**

- [ ] 页面加载时，插件视图正确定位
- [ ] 向下滚动时，视图不覆盖状态栏
- [ ] 向上滚动时，视图不超出搜索栏
- [ ] 窗口大小变化时，视图位置正确调整
- [ ] 多个插件视图同时显示时，都不覆盖状态栏
- [ ] 滚动到页面底部时，视图高度被正确裁剪

## 🔧 **性能监控**

### 检查更新频率
```javascript
let updateCount = 0
const originalConsoleLog = console.log

console.log = function(...args) {
    if (args[0] && args[0].includes('ViewLayoutManager: 批量更新')) {
        updateCount++
        console.info(`更新次数: ${updateCount}`)
    }
    originalConsoleLog.apply(console, args)
}
```

### 监控批量更新效果
```javascript
// 观察是否正确使用批量更新API
document.addEventListener('content-scroll', () => {
    console.time('view-update')
    setTimeout(() => console.timeEnd('view-update'), 100)
})
``` 