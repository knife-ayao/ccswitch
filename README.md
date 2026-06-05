# CC Switch - Git 检测与安装功能

## 📋 功能概述

本文档记录了 CC Switch 新增的 **Git 检测与一键安装功能**，该功能允许用户在应用内检测系统是否安装了 Git，并提供便捷的安装方式。

**版本**：3.17.0  
**作者**：DingWei (ayao)  
**日期**：2026-06-05

---

## ✨ 功能特性

### 1. 自动检测 Git 版本
- 🔄 应用启动时自动检测系统 Git 安装状态
- 📊 显示当前安装的 Git 版本号
- ⚠️ 未安装时显示明确提示

### 2. 一键安装 Git
- 🚀 提供便捷的一键安装按钮
- 🖱️ 点击即可自动安装 Git
- 📦 支持多种安装方式（见下方平台支持）

### 3. 多平台支持
| 操作系统 | 安装方式 | 包管理器 |
|---------|---------|---------|
| **Windows** | winget | `winget install Git.Git` |
| **macOS** | Homebrew | `brew install git` |
| **Linux** | apt | `sudo apt-get install git` |

### 4. 用户友好的界面
- 🎨 现代化 UI 设计
- 🔄 刷新按钮（手动重新检测）
- 📱 响应式布局
- 🌍 多语言支持（中文/英文）

---

## 🖼️ 界面展示

### 环境工具页面

```
┌─────────────────────────────────────────────────┐
│  环境工具                                        │
├────────────────────┬────────────────────────────┤
│  运行环境           │  工具安装                    │
│                    │                            │
│  ┌──────────────┐  │  ┌──────────────────────┐  │
│  │ Node.js      │  │  │ Claude Code CLI      │  │
│  │ ✅ 已安装     │  │  │ ...                  │  │
│  └──────────────┘  │  └──────────────────────┘  │
│                    │                            │
│  ┌──────────────┐  │  ┌──────────────────────┐  │
│  │ Python       │  │  │ Codex CLI            │  │
│  │ ...          │  │  │ ...                  │  │
│  └──────────────┘  │  └──────────────────────┘  │
│                    │                            │
│  ┌──────────────┐  │  ┌──────────────────────┐  │
│  │ Git          │  │  │ VS Code              │  │
│  │ ✅ 已安装 v2.44.0│ │  │ ...                  │  │
│  │              │  │  └──────────────────────┘  │
│  │ [刷新]       │  │                            │
│  └──────────────┘  │  ┌──────────────────────┐  │
│                    │  │ Edge                  │  │
│                    │  │ ...                  │  │
│                    │  └──────────────────────┘  │
└────────────────────┴────────────────────────────┘
```

### Git 安装状态示例

**已安装**：
```
┌─────────────────────────────────────────┐
│ 🔧 Git                                 │
│ 分布式版本控制系统，开发者必备工具          │
├─────────────────────────────────────────┤
│ ✅ 已安装 2.44.0    [刷新]              │
└─────────────────────────────────────────┘
```

**未安装**：
```
┌─────────────────────────────────────────┐
│ 🔧 Git                                 │
│ 分布式版本控制系统，开发者必备工具          │
├─────────────────────────────────────────┤
│ ⭕ 未安装     [刷新] [一键安装]          │
└─────────────────────────────────────────┘
```

---

## 🔧 技术实现

### 后端（Rust）

#### 1. 版本检测命令

```rust
// src-tauri/src/commands/misc.rs

#[tauri::command]
pub async fn get_git_version() -> Result<GitVersion, String> {
    // 执行 git --version
    // 解析版本号
    // 返回 GitVersion 结构体
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitVersion {
    pub installed: bool,
    pub version: Option<String>,
    pub error: Option<String>,
}
```

#### 2. 安装命令

```rust
#[tauri::command]
pub async fn install_git() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        // Windows: winget install Git.Git
    }
    
    #[cfg(target_os = "macos")]
    {
        // macOS: brew install git
    }
    
    #[cfg(target_os = "linux")]
    {
        // Linux: sudo apt-get install git
    }
}
```

### 前端（TypeScript/React）

#### 1. API 封装

```typescript
// src/lib/api/tools.ts

export interface GitVersion {
  installed: boolean;
  version: string | null;
  error: string | null;
}

export const toolsApi = {
  async getGitVersion(): Promise<GitVersion> {
    return await invoke("get_git_version");
  },

  async installGit(): Promise<string> {
    return await invoke("install_git");
  },
};
```

#### 2. GitInstaller 组件

```typescript
// src/components/tools/GitInstaller.tsx

export function GitInstaller() {
  const [gitInfo, setGitInfo] = useState<GitVersion | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // 检测 Git 版本
  const checkGitVersion = async () => { ... };

  // 安装 Git
  const installGit = async () => { ... };

  return (
    <Card>
      {/* Git logo */}
      {/* 版本信息 */}
      {/* 刷新按钮 */}
      {/* 安装按钮（未安装时显示） */}
    </Card>
  );
}
```

---

## 📁 文件结构

```
cc-switch/
├── src-tauri/
│   └── src/
│       └── commands/
│           └── misc.rs                    # Git 命令实现
├── src/
│   ├── components/
│   │   └── tools/
│   │       ├── GitInstaller.tsx           # Git 安装组件
│   │       └── EnvironmentToolsPage.tsx   # 环境工具页面
│   └── lib/
│       └── api/
│           └── tools.ts                   # API 封装
```

---

## 🚀 使用方法

### 1. 查看 Git 状态

应用启动后，切换到 **环境工具** 页面（首页第一页），即可看到 Git 的检测状态。

### 2. 刷新检测

点击 **刷新** 按钮可手动重新检测 Git 版本。

### 3. 一键安装

如果系统未安装 Git，点击 **一键安装** 按钮：
- Windows 系统会自动通过 winget 安装
- macOS 系统会自动通过 Homebrew 安装
- Linux 系统会自动通过 apt 安装

安装完成后会自动刷新状态。

---

## ⚠️ 注意事项

### 系统要求

| 操作系统 | 要求 |
|---------|------|
| **Windows** | 需要预装 winget（Windows 10 1709+ 自带） |
| **macOS** | 需要预装 Homebrew |
| **Linux** | 需要 sudo 权限和 apt 包管理器 |

### 常见问题

#### Q1: Windows 安装失败，提示 winget 未找到

**解决方案**：
1. 打开 Microsoft Store
2. 搜索 "应用安装程序"
3. 更新到最新版本
4. 重启应用后重试

#### Q2: macOS 安装失败，提示 brew 未找到

**解决方案**：
```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Q3: Linux 安装失败，提示权限不足

**解决方案**：
- 确保用户有 sudo 权限
- 或手动在终端执行：`sudo apt-get install git`

#### Q4: 安装完成后仍显示"未安装"

**可能原因**：
- Git 未添加到 PATH 环境变量
- 需要重启应用或刷新系统环境

**解决方案**：
1. 点击 **刷新** 按钮
2. 如果仍无效，重启应用
3. 检查系统环境变量是否包含 Git 路径

---

## 🔍 调试信息

### 查看日志

应用日志位于：
- **Windows**: `%APPDATA%/cc-switch/logs/`
- **macOS**: `~/Library/Logs/cc-switch/`
- **Linux**: `~/.local/share/cc-switch/logs/`

### 常见日志信息

```bash
# 成功检测到 Git
[tools] Git version detected: 2.44.0

# Git 未安装
[tools] Git not found: not installed or not executable

# 安装成功
[tools] Git installed successfully
```

---

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 检测耗时 | < 100ms |
| 安装耗时 | 30s - 3min（取决于网络） |
| 包大小影响 | +0 KB（无额外依赖） |

---

## 🔄 更新日志

### v3.17.0 (2026-06-05)

**新增功能**：
- ✅ Git 版本自动检测
- ✅ 一键安装 Git（支持 Windows/macOS/Linux）
- ✅ 环境工具页面集成 GitInstaller 组件

**改进**：
- 🎨 现代化 UI 设计
- 🌍 多语言支持
- 🔄 手动刷新功能

**Bug 修复**：
- 🐛 修复 NSIS 打包超时问题
- 🐛 清理卡密相关代码，修复 6 个编译警告

---

## 📚 相关资源

- [Git 官网](https://git-scm.com/)
- [Git 文档](https://git-scm.com/doc)
- [winget 文档](https://learn.microsoft.com/en-us/windows/package-manager/winget/)
- [Homebrew 文档](https://brew.sh/)

---

## 🤝 贡献

如有问题或建议，请联系：
- **作者**：ayao (ayao)
- **邮箱**：2938250266@qq.com

---

## 📄 许可证

本功能遵循 CC Switch 项目的 MIT 许可证。

---

**最后更新**：2026-06-05
