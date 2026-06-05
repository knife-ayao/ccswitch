/**
 * 浏览器安装模块
 *
 * 静默安装 Edge 浏览器
 */

use anyhow::{Context, Result};
use std::path::Path;
use std::process::Command;

/// 安装 Edge 浏览器
///
/// # Arguments
/// * `installer_path` - 安装包路径
///
/// # Returns
/// 安装是否成功
pub async fn install_edge(installer_path: &Path) -> Result<()> {
    if !installer_path.exists() {
        anyhow::bail!("安装包不存在: {:?}", installer_path);
    }

    log::info!("开始安装 Edge 浏览器: {:?}", installer_path);

    #[cfg(target_os = "windows")]
    {
        install_edge_windows(installer_path)
    }

    #[cfg(target_os = "macos")]
    {
        install_edge_macos(installer_path)
    }

    #[cfg(target_os = "linux")]
    {
        install_edge_linux(installer_path)
    }
}

/// Windows 上安装 Edge
#[cfg(target_os = "windows")]
fn install_edge_windows(installer_path: &Path) -> Result<()> {
    // 使用 msiexec 静默安装
    // /quiet - 静默模式
    // /norestart - 不自动重启
    let output = Command::new("msiexec")
        .args([
            "/i",
            installer_path.to_str().unwrap(),
            "/quiet",
            "/norestart",
        ])
        .output()
        .context("执行安装命令失败")?;

    if output.status.success() {
        log::info!("Edge 安装成功，正在关闭自动打开的浏览器窗口...");

        // 等待一下让安装程序完成
        std::thread::sleep(std::time::Duration::from_secs(2));

        // 关闭可能自动打开的 Edge 窗口
        let _ = Command::new("taskkill")
            .args(["/F", "/IM", "msedge.exe"])
            .output();

        log::info!("已关闭自动打开的 Edge 窗口");
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        log::error!("Edge 安装失败: stdout={}, stderr={}", stdout, stderr);
        anyhow::bail!("Edge 安装失败: {}", stderr)
    }
}

/// macOS 上安装 Edge
#[cfg(target_os = "macos")]
fn install_edge_macos(installer_path: &Path) -> Result<()> {
    // 使用 installer 命令安装 PKG
    let output = Command::new("sudo")
        .args([
            "installer",
            "-pkg",
            installer_path.to_str().unwrap(),
            "-target",
            "/",
        ])
        .output()
        .context("执行安装命令失败")?;

    if output.status.success() {
        log::info!("Edge 安装成功");
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("Edge 安装失败: {}", stderr)
    }
}

/// Linux 上安装 Edge
#[cfg(target_os = "linux")]
fn install_edge_linux(installer_path: &Path) -> Result<()> {
    // 尝试使用 dpkg 安装
    let output = Command::new("sudo")
        .args([
            "dpkg",
            "-i",
            installer_path.to_str().unwrap(),
        ])
        .output()
        .context("执行安装命令失败")?;

    if output.status.success() {
        log::info!("Edge 安装成功");
        Ok(())
    } else {
        // dpkg 可能需要修复依赖
        let stderr = String::from_utf8_lossy(&output.stderr);
        log::warn!("dpkg 安装失败，尝试修复依赖: {}", stderr);

        // 尝试修复依赖
        let fix_output = Command::new("sudo")
            .args(["apt-get", "install", "-f", "-y"])
            .output()
            .context("修复依赖失败")?;

        if fix_output.status.success() {
            log::info!("Edge 安装成功（通过依赖修复）");
            Ok(())
        } else {
            anyhow::bail!("Edge 安装失败: {}", stderr)
        }
    }
}

/// 验证安装是否成功
pub fn verify_installation() -> bool {
    crate::browser::detector::detect_edge().is_some()
}

/// 安装完成后清理安装包
pub fn cleanup_after_install() -> Result<()> {
    crate::browser::downloader::cleanup_installer()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verify_installation() {
        let result = verify_installation();
        println!("Edge installed: {}", result);
    }
}
