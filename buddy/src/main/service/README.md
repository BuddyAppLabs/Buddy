# 业务服务层 (services/)

这个目录包含应用的业务逻辑服务，负责处理复杂的业务规则和协调不同组件的交互。参考 Laravel 的服务层设计理念。

## 📁 目录结构

```tree
services/
├── PluginService.ts        # 插件业务服务 (待实现)
├── WindowService.ts        # 窗口管理服务 (待实现)
├── EventService.ts         # 事件处理服务 (待实现)
├── ConfigService.ts        # 配置管理服务 (待实现)
├── LogService.ts           # 日志服务 (待实现)
└── CacheService.ts         # 缓存服务 (待实现)
```

## 🎯 服务层概念

### 什么是服务层？

服务层位于控制器和数据层之间，负责：

- **业务逻辑封装** - 将复杂的业务规则封装到服务中
- **组件协调** - 协调多个仓储、外部API等
- **事务管理** - 管理复杂的数据操作
- **业务验证** - 执行业务规则验证

### 服务 vs 仓储 vs 控制器

```tree
Controller (HTTP层) → Service (业务层) → Repository (数据层)
```

- **Controller**: 处理 HTTP/IPC 请求和响应
- **Service**: 处理业务逻辑和规则
- **Repository**: 处理数据访问和持久化

## 📖 服务实现示例

### PluginService.ts

```typescript
/**
 * 插件业务服务
 * 负责插件的安装、卸载、管理等业务逻辑
 */
import { PluginRepository } from '@/repositories/PluginRepository';
import { EventService } from './EventService';
import { LogService } from './LogService';
import { Plugin } from '@/models/Plugin';
import { Action } from '@/models/Action';

export class PluginService {
  constructor(
    private pluginRepository: PluginRepository,
    private eventService: EventService,
    private logService: LogService
  ) {}

  /**
   * 获取所有插件
   */
  async getPlugins(): Promise<Plugin[]> {
    try {
      const plugins = await this.pluginRepository.getAll();

      // 业务逻辑：过滤已禁用的插件
      return plugins.filter((plugin) => !plugin.isDisabled());
    } catch (error) {
      this.logService.error('Failed to get plugins', { error });
      throw new Error('无法获取插件列表');
    }
  }

  /**
   * 搜索插件
   */
  async searchPlugins(keyword: string): Promise<Plugin[]> {
    if (!keyword || keyword.trim().length < 2) {
      return this.getPlugins();
    }

    try {
      const plugins = await this.pluginRepository.search(keyword);

      // 业务逻辑：按相关性排序
      return this.sortByRelevance(plugins, keyword);
    } catch (error) {
      this.logService.error('Failed to search plugins', { keyword, error });
      throw new Error('插件搜索失败');
    }
  }

  /**
   * 安装插件
   */
  async installPlugin(pluginId: string): Promise<boolean> {
    this.logService.info('Installing plugin', { pluginId });

    try {
      // 业务验证：检查是否已安装
      const existingPlugin = await this.pluginRepository.find(pluginId);
      if (existingPlugin) {
        throw new Error('插件已安装');
      }

      // 业务验证：检查依赖
      await this.validateDependencies(pluginId);

      // 执行安装
      const plugin = await this.pluginRepository.install(pluginId);

      // 业务逻辑：初始化插件
      await this.initializePlugin(plugin);

      // 发射事件
      this.eventService.emit('plugin:installed', { plugin });

      this.logService.info('Plugin installed successfully', { pluginId });
      return true;
    } catch (error) {
      this.logService.error('Plugin installation failed', { pluginId, error });
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(pluginId: string): Promise<boolean> {
    this.logService.info('Uninstalling plugin', { pluginId });

    try {
      const plugin = await this.pluginRepository.find(pluginId);
      if (!plugin) {
        throw new Error('插件不存在');
      }

      // 业务验证：检查是否有其他插件依赖此插件
      await this.validateDependents(pluginId);

      // 业务逻辑：清理插件数据
      await this.cleanupPlugin(plugin);

      // 执行卸载
      await this.pluginRepository.uninstall(pluginId);

      // 发射事件
      this.eventService.emit('plugin:uninstalled', { pluginId });

      this.logService.info('Plugin uninstalled successfully', { pluginId });
      return true;
    } catch (error) {
      this.logService.error('Plugin uninstallation failed', {
        pluginId,
        error,
      });
      throw error;
    }
  }

  /**
   * 执行插件动作
   */
  async executeAction(actionId: string, args: any[]): Promise<any> {
    const [pluginId, localActionId] = actionId.split(':');

    try {
      const plugin = await this.pluginRepository.find(pluginId);
      if (!plugin) {
        throw new Error('插件不存在');
      }

      if (!plugin.isEnabled()) {
        throw new Error('插件已被禁用');
      }

      // 业务逻辑：记录动作执行
      this.logService.debug('Executing plugin action', { actionId, args });

      const result = await plugin.executeAction(localActionId, args);

      // 发射事件
      this.eventService.emit('plugin:action:executed', { actionId, result });

      return result;
    } catch (error) {
      this.logService.error('Plugin action execution failed', {
        actionId,
        error,
      });
      throw error;
    }
  }

  /**
   * 获取插件动作列表
   */
  async getActions(keyword?: string): Promise<Action[]> {
    try {
      const plugins = await this.getPlugins();
      let actions: Action[] = [];

      // 收集所有插件的动作
      for (const plugin of plugins) {
        const pluginActions = await plugin.getActions();
        actions.push(...pluginActions);
      }

      // 如果有关键词，进行过滤
      if (keyword) {
        actions = actions.filter(
          (action) =>
            action.name.toLowerCase().includes(keyword.toLowerCase()) ||
            action.description.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      // 业务逻辑：按使用频率排序
      return this.sortActionsByUsage(actions);
    } catch (error) {
      this.logService.error('Failed to get actions', { keyword, error });
      throw new Error('无法获取动作列表');
    }
  }

  /**
   * 私有方法：验证依赖
   */
  private async validateDependencies(pluginId: string): Promise<void> {
    // 实现依赖验证逻辑
  }

  /**
   * 私有方法：验证依赖者
   */
  private async validateDependents(pluginId: string): Promise<void> {
    // 实现依赖者验证逻辑
  }

  /**
   * 私有方法：初始化插件
   */
  private async initializePlugin(plugin: Plugin): Promise<void> {
    // 实现插件初始化逻辑
  }

  /**
   * 私有方法：清理插件
   */
  private async cleanupPlugin(plugin: Plugin): Promise<void> {
    // 实现插件清理逻辑
  }

  /**
   * 私有方法：按相关性排序
   */
  private sortByRelevance(plugins: Plugin[], keyword: string): Plugin[] {
    return plugins.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, keyword);
      const bScore = this.calculateRelevanceScore(b, keyword);
      return bScore - aScore;
    });
  }

  /**
   * 私有方法：计算相关性分数
   */
  private calculateRelevanceScore(plugin: Plugin, keyword: string): number {
    let score = 0;
    const lowerKeyword = keyword.toLowerCase();

    if (plugin.name.toLowerCase().includes(lowerKeyword)) score += 10;
    if (plugin.description.toLowerCase().includes(lowerKeyword)) score += 5;

    return score;
  }

  /**
   * 私有方法：按使用频率排序动作
   */
  private sortActionsByUsage(actions: Action[]): Action[] {
    return actions.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  }
}
```

### WindowService.ts

```typescript
/**
 * 窗口管理服务
 * 负责窗口的创建、管理和协调
 */
import { BrowserWindow } from 'electron';
import { EventService } from './EventService';
import { ConfigService } from './ConfigService';

export interface WindowOptions {
  width?: number;
  height?: number;
  title?: string;
  resizable?: boolean;
  show?: boolean;
}

export class WindowService {
  private windows = new Map<string, BrowserWindow>();

  constructor(
    private eventService: EventService,
    private configService: ConfigService
  ) {}

  /**
   * 创建新窗口
   */
  async createWindow(options: WindowOptions = {}): Promise<BrowserWindow> {
    const defaultOptions = this.getDefaultWindowOptions();
    const windowOptions = { ...defaultOptions, ...options };

    const window = new BrowserWindow(windowOptions);
    const windowId = this.generateWindowId();

    this.windows.set(windowId, window);

    // 设置事件监听
    this.setupWindowEvents(window, windowId);

    // 业务逻辑：记录窗口创建
    this.eventService.emit('window:created', {
      windowId,
      options: windowOptions,
    });

    return window;
  }

  /**
   * 关闭窗口
   */
  async closeWindow(windowId: string): Promise<void> {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error('窗口不存在');
    }

    // 业务逻辑：保存窗口状态
    await this.saveWindowState(window, windowId);

    window.close();
    this.windows.delete(windowId);

    this.eventService.emit('window:closed', { windowId });
  }

  /**
   * 获取所有窗口
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  /**
   * 私有方法：获取默认窗口选项
   */
  private getDefaultWindowOptions(): any {
    return {
      width: this.configService.get('window.defaultWidth', 1200),
      height: this.configService.get('window.defaultHeight', 800),
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    };
  }

  /**
   * 私有方法：设置窗口事件
   */
  private setupWindowEvents(window: BrowserWindow, windowId: string): void {
    window.on('closed', () => {
      this.windows.delete(windowId);
      this.eventService.emit('window:destroyed', { windowId });
    });

    window.on('focus', () => {
      this.eventService.emit('window:focused', { windowId });
    });

    window.on('blur', () => {
      this.eventService.emit('window:blurred', { windowId });
    });
  }

  /**
   * 私有方法：生成窗口ID
   */
  private generateWindowId(): string {
    return `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 私有方法：保存窗口状态
   */
  private async saveWindowState(
    window: BrowserWindow,
    windowId: string
  ): Promise<void> {
    const bounds = window.getBounds();
    await this.configService.set(`windows.${windowId}.bounds`, bounds);
  }
}
```

## 🚀 服务使用示例

### 在控制器中使用服务

```typescript
// http/controllers/PluginController.ts
export class PluginController {
  constructor(private pluginService: PluginService) {}

  async list(request: IPCRequest): Promise<IPCResponse> {
    try {
      const [keyword] = request.args;
      const plugins = await this.pluginService.searchPlugins(keyword);

      return {
        success: true,
        data: plugins,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async install(request: IPCRequest): Promise<IPCResponse> {
    try {
      const [pluginId] = request.args;
      const success = await this.pluginService.installPlugin(pluginId);

      return {
        success,
        data: { message: `Plugin ${pluginId} installed successfully` },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

### 在服务提供者中注册

```typescript
// providers/PluginServiceProvider.ts
export class PluginServiceProvider extends ServiceProvider {
  public register(): void {
    // 注册服务
    this.app.singleton('plugin.service', (container) => {
      return new PluginService(
        container.resolve('plugin.repository'),
        container.resolve('event.service'),
        container.resolve('log.service')
      );
    });
  }
}
```

## 📝 服务设计最佳实践

### 1. 单一职责原则

```typescript
// ✅ 好的做法 - 职责单一
export class PluginService {
  // 只处理插件相关的业务逻辑
}

export class WindowService {
  // 只处理窗口相关的业务逻辑
}

// ❌ 不好的做法 - 职责混杂
export class AppService {
  // 处理插件、窗口、配置等所有逻辑
}
```

### 2. 依赖注入

```typescript
// ✅ 通过构造函数注入依赖
export class PluginService {
  constructor(
    private pluginRepository: PluginRepository,
    private eventService: EventService
  ) {}
}

// ❌ 硬编码依赖
export class PluginService {
  private pluginRepository = new PluginRepository();
  private eventService = new EventService();
}
```

### 3. 错误处理

```typescript
export class PluginService {
  async installPlugin(pluginId: string): Promise<boolean> {
    try {
      // 业务逻辑
      return true;
    } catch (error) {
      // 记录错误
      this.logService.error('Plugin installation failed', { pluginId, error });

      // 重新抛出有意义的错误
      throw new Error(`无法安装插件 ${pluginId}: ${error.message}`);
    }
  }
}
```

### 4. 事件发射

```typescript
export class PluginService {
  async installPlugin(pluginId: string): Promise<boolean> {
    // 安装前事件
    this.eventService.emit('plugin:installing', { pluginId });

    // 执行安装
    const result = await this.doInstall(pluginId);

    // 安装后事件
    this.eventService.emit('plugin:installed', { pluginId, success: result });

    return result;
  }
}
```

## 🔄 与 Laravel 的对应关系

| Buddy         | Laravel       | 说明         |
| ------------- | ------------- | ------------ |
| PluginService | Service Class | 业务服务类   |
| 构造函数注入  | 构造函数注入  | 依赖注入方式 |
| EventService  | Event         | 事件系统     |

## 🧪 测试服务

```typescript
describe('PluginService', () => {
  let pluginService: PluginService;
  let mockRepository: jest.Mocked<PluginRepository>;
  let mockEventService: jest.Mocked<EventService>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    mockEventService = createMockEventService();

    pluginService = new PluginService(
      mockRepository,
      mockEventService,
      mockLogService
    );
  });

  describe('installPlugin', () => {
    it('should install plugin successfully', async () => {
      mockRepository.find.mockResolvedValue(null);
      mockRepository.install.mockResolvedValue(mockPlugin);

      const result = await pluginService.installPlugin('test-plugin');

      expect(result).toBe(true);
      expect(mockEventService.emit).toHaveBeenCalledWith('plugin:installed', {
        plugin: mockPlugin,
      });
    });

    it('should throw error if plugin already exists', async () => {
      mockRepository.find.mockResolvedValue(mockPlugin);

      await expect(pluginService.installPlugin('test-plugin')).rejects.toThrow(
        '插件已安装'
      );
    });
  });
});
```
