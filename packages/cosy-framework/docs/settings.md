# Setting 系统使用指南

`Setting` 模块为您的应用程序提供了一个简单、持久的键值存储系统，非常适合用来保存用户偏好设置。

## 配置

要使用 `Setting` 模块，您需要先在应用程序的配置中进行设置。

### 1. 配置 `userDataPath`

`Setting` 模块会将用户的设置保存在一个名为 `settings.json` 的文件中。这个文件存储在您为应用程序指定的 `userDataPath` 目录下。

在您的应用配置中，请确保 `paths.userData` 指向一个有效的、可写的目录路径。

```typescript
// an-example-bootstrap-file.ts
import { Application } from '@cosy/framework';

const app = Application.getInstance({
  name: 'Your App Name',
  version: '1.0.0',
  env: 'development',
  debug: true,
  paths: {
    // 确保这个路径是您的应用有权限读写的
    userData: '/path/to/your/app/data'
  },
  // ...
});
```

### 2. 注册服务提供者

接下来，您需要注册 `SettingServiceProvider`，它负责启动和管理 `Setting` 模块。

将 `SettingServiceProvider` 添加到您的应用配置的 `providers` 数组中。

```typescript
// an-example-bootstrap-file.ts
import { Application, SettingServiceProvider } from '@cosy/framework';

const app = Application.getInstance({
  // ...
  providers: [
    // ... other providers
    SettingServiceProvider,
  ],
  // ...
});
```

## 使用方法

配置完成后，您就可以在代码中通过 `SettingFacade` 方便地读取和写入设置了。

### 读取设置

使用 `get` 方法来获取一个设置项。如果该设置项不存在，您可以提供一个默认值。当提供了默认值时，返回值的类型将与默认值相同；否则，它可能是 `undefined`。

```typescript
import { SettingFacade } from '@cosy/framework';

// 获取主题设置，如果不存在则默认为 'light'
// 因为提供了默认值，所以 `theme` 的类型是 string
const theme = SettingFacade.get('app.theme', 'light');

// 获取窗口尺寸。未提供默认值，因此 `windowSize` 的类型可能是 `any | undefined`
const windowSize = SettingFacade.get('window.size');

// 您也可以显式指定期望的类型
interface WindowSize {
  width: number;
  height: number;
}
const size = SettingFacade.get<WindowSize>('window.size');
if (size) {
  console.log(size.width);
}
```

### 写入设置

使用 `set`