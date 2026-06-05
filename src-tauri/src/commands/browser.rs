/**
 * 浏览器管理 Tauri 命令
 */

use crate::browser::{detector, downloader, installer, BrowserStatus};
use tauri::{command, Emitter};

/// 检测浏览器状态
#[command]
pub async fn check_browser() -> Result<BrowserStatus, String> {
    Ok(detector::get_browser_status())
}

/// 下载浏览器
#[command]
pub async fn download_browser(window: tauri::Window) -> Result<(), String> {
    let window_clone = window.clone();

    let progress_callback = move |progress: f64| {
        let _ = window_clone.emit("browser-download-progress", progress);
    };

    downloader::download_edge(progress_callback)
        .await
        .map_err(|e| format!("下载失败: {}", e))?;

    Ok(())
}

/// 安装浏览器
#[command]
pub async fn install_browser() -> Result<(), String> {
    let installer_path = downloader::get_installer_file_path();

    if !installer_path.exists() {
        return Err("安装包不存在，请先下载".to_string());
    }

    installer::install_edge(&installer_path)
        .await
        .map_err(|e| format!("安装失败: {}", e))?;

    // 安装成功后清理安装包
    let _ = downloader::cleanup_installer();

    Ok(())
}

/// 获取浏览器可执行文件路径
#[command]
pub fn get_browser_path() -> Result<String, String> {
    detector::get_edge_executable_path()
}

/// 一键下载并安装浏览器
#[command]
pub async fn download_and_install_browser(window: tauri::Window) -> Result<(), String> {
    // 先检查是否已安装
    let status = detector::get_browser_status();
    if status.installed {
        return Err("Edge 浏览器已安装".to_string());
    }

    // 下载
    let window_clone = window.clone();
    let progress_callback = move |progress: f64| {
        let _ = window_clone.emit("browser-download-progress", progress);
    };

    let installer_path = downloader::download_edge(progress_callback)
        .await
        .map_err(|e| format!("下载失败: {}", e))?;

    // 安装
    installer::install_edge(&installer_path)
        .await
        .map_err(|e| format!("安装失败: {}", e))?;

    // 清理安装包
    let _ = downloader::cleanup_installer();

    // 验证安装
    if installer::verify_installation() {
        Ok(())
    } else {
        Err("安装验证失败，请手动检查".to_string())
    }
}

/// 清理下载的安装包
#[command]
pub fn cleanup_browser_installer() -> Result<(), String> {
    downloader::cleanup_installer()
        .map_err(|e| format!("清理失败: {}", e))
}
