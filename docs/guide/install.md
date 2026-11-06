---
title: 安装指南 — Windows / macOS / Ubuntu 安装与升级教程
description: 素言输入法在 Windows、macOS 与 Ubuntu（Fcitx5）三大平台的安装教程，含各平台最低系统版本、SmartScreen 与 Gatekeeper 拦截放行、输入法添加、升级与卸载步骤。
---

# 安装指南

## 系统要求

| 平台 | 最低版本 | 架构与依赖 | 安装包 |
|------|---------|-----------|--------|
| Windows | Windows 10（64 位）或更高 | x64；ARM64 设备会自动注册原生输入法模块，服务进程由系统仿真运行 | `SuYan-x.x.x-windows.exe` |
| macOS | macOS 15.0 (Sequoia) 或更高 | Apple Silicon 与 Intel 分别提供安装包 | `SuYan-x.x.x-macos-arm64.pkg` / `SuYan-x.x.x-macos-x86_64.pkg` |
| Ubuntu Linux | Ubuntu 22.04 LTS 或更高 | amd64，需 Fcitx5 输入法框架；单个 DEB 兼容 24.04 / 26.04 | `SuYan-x.x.x-linux-amd64.deb` |

> 低于上述版本的系统无法正常使用：macOS 安装包会在安装前检查系统版本，Windows 二进制以 Windows 10 API 为编译基线，Ubuntu 安装包以 22.04 为最旧依赖基线（在 22.04 上构建，不能装在更旧的发行版上）。

## Windows

1. 下载最新安装包 `SuYan-x.x.x-windows.exe`。
2. 双击运行，根据提示完成安装。
3. 进入 **设置 -> 时间和语言 -> 语言和区域 -> 中文 -> 语言选项**。
4. 点击 **添加键盘**，选择 **素言输入法**。

> ⚠️ **注意**：由于没有购买昂贵的 Windows 签名证书，安装时可能会弹出 SmartScreen 拦截提示，请点击“更多信息” -> “仍要运行”。

## macOS

1. 按芯片选择安装包：Apple Silicon 下载 `SuYan-x.x.x-macos-arm64.pkg`，Intel 下载 `SuYan-x.x.x-macos-x86_64.pkg`。
2. 双击安装。
3. 系统可能会提示“来自未被认可的开发者”，请到 **系统设置 -> 隐私与安全性** 中点击“仍要打开”。
4. 安装完成后，在右上角输入法菜单中添加 **素言**。

## Ubuntu Linux

素言通过 Fcitx5 输入法框架接入 Ubuntu 系统，支持 22.04 及以上版本。

### 安装步骤

1. **安装 Fcitx5 框架**（如已安装可跳过）：

   ```bash
   sudo apt update
   sudo apt install fcitx5 fcitx5-config-qt
   ```

2. **下载素言 .deb 安装包** `SuYan-x.x.x-linux-amd64.deb`。

3. **安装素言**：

   ```bash
   sudo dpkg -i SuYan-x.x.x-linux-amd64.deb
   sudo apt install -f   # 自动补齐缺失依赖
   ```

4. **重启 Fcitx5** 或注销重新登录：

   ```bash
   fcitx5 -r
   ```

5. **启用素言输入法**：打开 **Fcitx5 配置** 工具，在「输入法」列表中添加「素言」。

> ⚠️ **Wayland 用户注意**：素言使用 xdg-portal 统一适配 X11 与 Wayland，无需额外配置。如遇候选框定位异常，请确保系统已安装 `xdg-desktop-portal`。

### 卸载

```bash
sudo apt remove suyan
```

## 升级

直接下载新版覆盖安装即可，你的用户词库（User Data）会自动保留。若已开启云同步，登录账号后会自动从云端拉取最新词库与配置。
