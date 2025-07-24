# macOS 应用自动化签名与公证体系文档

## 1. 目标

本文档旨在阐述项目中所采用的 macOS 应用自动化签名与公证体系。该体系的目标是解决传统签名方式的痛点，例如：

- **证书管理混乱**：开发者各自管理证书，容易导致版本不一、证书失效等问题。
- **手动操作繁琐**：每次构建都需要手动选择证书、输入密码，效率低下且容易出错。
- **CI/CD 集成困难**：在持续集成环境中安全地处理敏感的证书和密钥是一个巨大的挑战。

通过本体系，我们实现了一个**安全、高效、全自动化**的签名与公证流程，开发者无需关心证书细节，即可在本地和 CI/CD 环境中构建出可供分发的应用。

## 2. 核心概念

本体系主要依赖于两个核心工具/概念：

### 2.1. App Store Connect API 密钥

这是苹果官方提供的、用于以编程方式访问 App Store Connect 服务的“令牌”。它由三部分组成：

- **密钥 ID (Key ID)**
- **Issuer ID**
- **`.p8` 私钥文件**

通过这个 API 密钥，我们的自动化脚本（Fastlane）获得了代表我们在开发者后台执行操作的权限，例如：

- 查询 App 列表
- 创建、下载、吊销签名证书
- 创建和管理描述文件 (Provisioning Profiles)

这是实现完全自动化的基础。

### 2.2. Fastlane `match`

`match` 是 [Fastlane](https://fastlane.tools/) 工具集中的一个核心动作 (action)，它的理念是 **“代码签名证书的唯一真实来源 (Single Source of Truth)”**。

它的工作方式如下：

1. **创建私有 Git 仓库**：我们创建一个私有的 Git 仓库，专门用于存储代码签名资产。
2. **加密存储**：`match` 首次运行时，会使用 App Store Connect API 创建一套全新的证书和描述文件。然后，它会用你提供的密码将这些文件**加密**，并提交到这个私有的 Git 仓库中。
3. **按需同步**：在任何开发机或 CI/CD 服务器上，开发者只需运行 `fastlane match`。它会自动从私有仓库中拉取加密的证书，解密后安装到本地的临时钥匙串中，并配置好所有必要的环境变量。

![Fastlane Match Flow](https://docs.fastlane.tools/img/match-flow.png)

通过这种方式，所有团队成员和 CI/CD 系统都使用同一套证书，保证了签名的一致性和可靠性。

## 3. 自动化工作流程

整个流程分为首次设置和日常使用两个阶段。

### 3.1. 首次设置 (管理员)

1. **生成 API 密钥**：在 App Store Connect 后台生成 API 密钥，并记录下三要素。
2. **创建私有仓库**：在 GitHub 上创建一个用于存储证书的私有仓库。
3. **本地运行 `match`**：在本地配置好所有必需的环境变量（API 密钥、Git 仓库地址、加密密码），首次运行 `fastlane match`。此步骤会生成证书并将其推送到私有仓库。
4. **配置 CI/CD**：将所有需要的凭证（API 密钥、仓库地址、解密密码）作为 Secrets 添加到 GitHub Actions 的配置中。

### 3.2. 日常使用 (开发者/CI)

1. **触发构建**：开发者提交代码或手动触发 CI/CD 工作流。
2. **CI 环境准备**：CI 服务器 (GitHub Actions Runner) 检出代码。
3. **执行 Fastlane**：CI 工作流执行 `fastlane` 命令。
4. **`match` 同步证书**：`match` 动作启动，它连接到私有 Git 仓库，拉取加密的证书，用 Secret 中存储的密码解密，并安装到临时的钥匙串中。
5. **执行构建**：`electron-builder` 等构建工具启动。由于 Fastlane 已经配置好了签名环境，`electron-builder` 能自动找到证书并成功完成签名和公证。
6. **发布应用**：构建出的 `.dmg` 文件被上传到 GitHub Release。

## 4. 所需凭证与环境变量

为了让整个系统运转起来，CI/CD 环境或本地的 `.env` 文件需要以下变量：

| 变量名                              | 描述                                                                 |
| ----------------------------------- | -------------------------------------------------------------------- |
| `APP_STORE_CONNECT_KEY_ID`          | App Store Connect API 的密钥 ID。                                    |
| `APP_STORE_CONNECT_KEY_ISSER_ID`    | App Store Connect API 的 Issuer ID。                                 |
| `APP_STORE_CONNECT_KEY_BASE64`      | `.p8` 密钥文件经过 Base64 编码后的内容。                             |
| `MATCH_GIT_URL`                     | 存储证书的私有 Git 仓库地址 (SSH 格式)。                             |
| `MATCH_PASSWORD`                    | 用于加密和解密证书仓库的密码。                                       |
| `MATCH_SSH_PRIVATE_KEY`             | 用于访问私有 Git 仓库的 SSH 私钥 (如果使用 SSH 地址，CI/CD 中需要)。   |

### 如何生成 `APP_STORE_CONNECT_KEY_BASE64`

`.p8` 私钥文件是敏感信息，**严禁使用任何在线工具**进行 Base64 转换。请务必在你的本地 Mac 电脑上使用终端生成。

1.  **找到你的 `.p8` 文件**：通常命名为 `AuthKey_XXXXXXXXXX.p8`。
2.  **打开终端**，执行以下命令，并将路径替换为你的实际文件路径：

    ```bash
    base64 -i /path/to/your/AuthKey_XXXXXXXXXX.p8 | tr -d '\n' | pbcopy
    ```

3.  该命令会安全地将文件内容进行 Base64 编码，移除换行，并**直接复制到你的剪贴板**。
4.  最后，将剪贴板中的内容粘贴到 `.env` 文件或 CI/CD 的 Secrets 中即可。


## 5. 新开发者配置指南

新加入的开发者无需关心证书的创建和管理，只需执行以下简单步骤即可在本地构建签名应用：

1. **获取访问权限**：
    - 确保你拥有对证书私有 Git 仓库的**只读**权限。
    - 从团队管理员处获取所有需要的凭证，特别是 `MATCH_PASSWORD`。

2. **安装环境**：
    - 安装 `rbenv` 和 `ruby-build` (推荐)。
    - 使用 `rbenv` 安装项目指定的 Ruby 版本 (查看 `buddy/.ruby-version` 文件)。
    - 在 `buddy/` 目录下运行 `bundle install` 安装 Fastlane 及其插件。

3. **配置 `.env` 文件**：
    - 在 `buddy/` 目录下，复制 `.env.example` 文件并重命名为 `.env`。
    - 打开 `.env` 文件，将所有凭证信息填写完整。关于如何生成 `APP_STORE_CONNECT_KEY_BASE64`，请参考 [如何生成 APP_STORE_CONNECT_KEY_BASE64](#如何生成-app_store_connect_key_base64) 章节。

4. **运行 `match`**：在 `buddy/` 目录下运行 `bundle exec fastlane mac setup_signing`。Fastlane 会自动加载 `.env` 文件中的配置，并为你同步好签名证书。

5. **开始构建**：现在你可以正常运行项目的构建命令了。
