/**
 * 浏览器管理模块
 *
 * 提供 Edge 浏览器的检测、下载、安装功能
 */

pub mod detector;
pub mod downloader;
pub mod installer;

/// 浏览器信息
#[derive(Debug, Clone, serde::Serialize)]
pub struct BrowserInfo {
    pub path: String,
    pub version: String,
}

/// 浏览器状态
#[derive(Debug, Clone, serde::Serialize)]
pub struct BrowserStatus {
    pub installed: bool,
    pub version: Option<String>,
    pub path: Option<String>,
}
