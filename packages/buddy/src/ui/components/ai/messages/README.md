# AI 消息组件

这个目录包含了用于渲染不同类型 AI 消息的组件。

## 组件结构

### ChatMessage.vue

主消息组件，负责根据消息的 `parts` 数组动态渲染不同类型的内容。

**Props:**

- `message`: 消息对象，包含 `id`, `role`, `parts`

**功能:**

- 根据 `part.type` 动态选择渲染组件
- 支持的类型：
  - `text` - 文本消息
  - `reasoning` - AI 推理过程
  - `tool-*` - 工具调用

### ChatText.vue

文本消息组件，用于渲染普通文本内容。

**Props:**

- `messageId`: 消息 ID
- `role`: 消息角色 (`user` | `assistant` | `system`)
- `text`: 文本内容

**特性:**

- 使用 DaisyUI 的 chat bubble 样式
- 根据角色显示不同的颜色
- 支持多行文本和换行

### ChatReasoning.vue

推理过程组件，用于显示 AI 的思考过程。

**Props:**

- `messageId`: 消息 ID
- `reasoning`: 推理内容

**特性:**

- 使用特殊的样式突出显示
- 带有"思考过程"标签

### ChatTool.vue

工具调用组件，用于显示工具的调用和结果。

**Props:**

- `toolPart`: 工具调用对象

**特性:**

- 显示工具名称
- 显示工具参数
- 显示工具执行结果
- 支持扩展更多工具类型

## 使用示例

```vue
<template>
  <ChatMessage
    v-for="message in messages"
    :key="message.id"
    :message="message" />
</template>

<script setup>
  import ChatMessage from '@/ui/components/ai/messages/ChatMessage.vue';

  const messages = ref([
    {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: '你好' }],
    },
    {
      id: '2',
      role: 'assistant',
      parts: [
        { type: 'reasoning', reasoning: '用户在打招呼' },
        { type: 'text', text: '你好！有什么可以帮助你的吗？' },
      ],
    },
  ]);
</script>
```

## 扩展新的消息类型

1. 在 `messages/` 目录下创建新的组件，如 `ChatImage.vue`
2. 在 `ChatMessage.vue` 中导入并添加条件渲染
3. 根据 `part.type` 匹配新的类型

## 设计原则

- **单一职责**: 每个组件只负责渲染一种类型的内容
- **可扩展**: 通过添加新组件轻松支持新的消息类型
- **类型安全**: 使用 TypeScript 确保类型正确
- **样式一致**: 使用 DaisyUI 的 chat 组件保持样式统一
