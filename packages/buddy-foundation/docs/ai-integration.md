# AI服务集成文档

## 概述

AI服务提供者是Buddy Foundation中的一个核心组件，它封装了原始的`AIManager`，提供了Laravel风格的服务容器和Facade访问模式。

## 架构设计

### 核心组件

1. **AIContract** - AI服务契约，定义了AI管理器需要实现的方法
2. **AIManager** - AI管理器，封装原始的AIManager实例
3. **AIServiceProvider** - AI服务提供者，负责服务注册和生命周期管理
4. **AI Facade** - 提供静态方法访问AI服务

### 目录结构

```
packages/buddy-foundation/src/ai/
├── contracts/
│   └── AIContract.ts          # AI服务契约
├── facades/
│   └── AI.ts                  # AI Facade
├── AIManager.ts               # AI管理器实现
├── AIServiceProvider.ts       # AI服务提供者
└── index.ts                   # 模块导出
```

## 集成步骤

### 1. 注册服务提供者

在`buddy/src/main/bootstrap/app.ts`中注册AI服务提供者：

```typescript
import { AIServiceProvider, AI } from '@coffic/buddy-foundation';

const config: ElectronAppConfig = {
    providers: [
        ConfigServiceProvider,
        LogServiceProvider,
        AIServiceProvider,  // 添加AI服务提供者
        // ... 其他服务提供者
    ],
};
```

### 2. 初始化AI服务

```typescript
async function initializeAIService(application: any): Promise<void> {
    try {
        // 从容器中获取AI管理器
        const aiManagerFromContainer = application.make('ai');
        
        // 使用原始的aiManager实例初始化Foundation的AI管理器
        aiManagerFromContainer.initialize(aiManager);
        
        // 设置AI Facade
        AI.setManager(aiManagerFromContainer);
        
        console.log('✅ AI服务初始化完成');
    } catch (error) {
        console.warn('⚠️ AI服务初始化失败:', error);
    }
}
```

## 使用方式

### 通过Facade访问（推荐）

```typescript
import { AI } from '@coffic/buddy-foundation';

// 发送聊天消息
await AI.sendChatMessage(
    messages,
    (chunk) => console.log('收到chunk:', chunk),
    () => console.log('对话完成'),
    { temperature: 0.8 },
    'request-123'
);

// 获取可用模型
const models = AI.getAvailableModels();

// 设置默认模型
AI.setDefaultModel({
    type: 'openai',
    modelName: 'gpt-4',
    temperature: 0.7
});

// 取消请求
AI.cancelRequest('request-123');

// 重置配置
AI.resetConfig();
```

### 通过容器访问

```typescript
import { AIContract } from '@coffic/buddy-foundation';

// 从容器中解析AI服务
const aiManager = app.make<AIContract>('ai');

await aiManager.sendChatMessage(messages, onChunk, onFinish);
```

### 通过直接实例访问

```typescript
import { AIManager } from '@coffic/buddy-foundation';

const aiManager = AIManager.getInstance();
// 需要先初始化
aiManager.initialize(originalAIManager);

await aiManager.sendChatMessage(messages, onChunk, onFinish);
```

## 类型定义

### AIModelType

```typescript
type AIModelType = 'openai' | 'anthropic' | 'deepseek';
```

### AIModelConfig

```typescript
interface AIModelConfig {
    type: AIModelType;
    modelName: string;
    apiKey: string;
    system?: string;
    temperature?: number;
    maxTokens?: number;
}
```

### 聊天消息

```typescript
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
```

## 特性

1. **单例模式** - AIManager使用单例模式，确保全局唯一性
2. **服务容器集成** - 完全集成到Cosy服务容器中
3. **Facade支持** - 提供便捷的静态访问方式
4. **生命周期管理** - 自动处理服务的启动和关闭
5. **错误处理** - 提供友好的错误处理和降级机制
6. **类型安全** - 完整的TypeScript类型定义

## 注意事项

1. **初始化顺序** - AI服务提供者需要在应用启动后手动初始化
2. **依赖关系** - AI服务依赖于原始的AIManager实例
3. **错误处理** - 如果AI服务初始化失败，应用仍然可以正常启动
4. **内存管理** - Foundation的AIManager只是原始AIManager的代理，不会重复创建资源

## 扩展

如果需要扩展AI功能，可以：

1. 在`AIContract`中添加新的方法定义
2. 在`AIManager`中实现对应的方法
3. 在`AI` Facade中添加相应的静态方法
4. 更新类型定义和文档

## 示例项目

参考`buddy/src/main/bootstrap/app.ts`中的完整集成示例。 