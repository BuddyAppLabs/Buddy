# Buddy 文档

这是 Buddy 应用程序的官方文档，提供了关于应用架构、使用指南和开发者指南的详细信息。

## 贡献指南

我们欢迎社区贡献，如果您想要改进这些文档：

1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b my-new-feature`)
3. 提交您的改动 (`git commit -am 'Add some feature'`)
4. 推送到分支 (`git push origin my-new-feature`)
5. 创建一个 Pull Request

## 问题排查 (Troubleshooting)

### 生产环境应用启动失败

**现象:**

打包好的应用在启动时，图标在 Dock 栏（或任务栏）跳动几下后就直接退出，并且没有生成任何日志文件。

**原因:**

这通常意味着应用在非常早期的初始化阶段就遇到了致命错误，此时我们自定义的日志系统（`cosy-framework`）还未成功启动，因此无法记录错误。

**解决方案:**

我们需要从终端（Terminal 或 Command Prompt）直接运行应用的可执行文件，这样可以捕获到最原始的启动错误信息。

#### macOS

1.  打开"终端"应用程序。
2.  执行以下命令，将路径替换为你的应用实际路径：
    ```bash
    /Applications/YourApp.app/Contents/MacOS/YourApp
    ```
    例如，对于 `buddy` 应用，命令通常是：
    ```bash
    /Applications/buddy.app/Contents/MacOS/buddy
    ```

#### Windows

1.  打开"命令提示符"或"PowerShell"。
2.  `cd` 到应用的安装目录。
3.  直接运行 `.exe` 文件：
    ```bash
    YourApp.exe
    ```

#### Linux

1.  打开你的终端。
2.  `cd` 到应用的安装目录。
3.  运行可执行文件（通常是与应用同名的文件）：
    ```bash
    ./your-app
    ```

执行命令后，导致应用崩溃的错误信息会直接打印在终端窗口中。你可以根据这些信息来定位问题。

## 联系我们

如有任何问题或建议，请通过以下方式联系我们：

- 项目 Issue：[GitHub Issues](https://github.com/CofficLab/GitOK/issues)
- 邮箱：[contact@example.com](mailto:contact@example.com)

---

© 2023 CofficLab. 保留所有权利。
