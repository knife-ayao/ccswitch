/**
 * 浏览器检测模块
 *
 * 检测系统是否已安装 Edge 浏览器
 */

use std::path::Path;
use std::process::Command;

use super::{BrowserInfo, BrowserStatus};

/// Windows 上 Edge 浏览器的可能路径
const EDGE_PATHS: &[&str] = &[
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
];

/// macOS 上 Edge 浏览器的可能路径
#[cfg(target_os = "macos")]
const EDGE_PATHS_MACOS: &[&str] = &[
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

/// Linux 上 Edge 浏览器的可能路径
#[cfg(target_os = "linux")]
const EDGE_PATHS_LINUX: &[&str] = &[
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable",
    "/opt/microsoft/msedge/msedge",
];

/// 检测 Edge 是否已安装
pub fn detect_edge() -> Option<BrowserInfo> {
    let paths = get_edge_paths();

    for path in paths {
        if Path::new(path).exists() {
            let version = get_edge_version(path);
            return Some(BrowserInfo {
                path: path.to_string(),
                version,
            });
        }
    }

    None
}

/// 获取浏览器状态
pub fn get_browser_status() -> BrowserStatus {
    match detect_edge() {
        Some(info) => BrowserStatus {
            installed: true,
            version: Some(info.version),
            path: Some(info.path),
        },
        None => BrowserStatus {
            installed: false,
            version: None,
            path: None,
        },
    }
}

/// 获取 Edge 版本号
/// 注意：不执行 Edge 程序，只从文件属性中获取版本
fn get_edge_version(path: &str) -> String {
    // 从路径中提取版本号
    // 路径格式：C:\Program Files\Microsoft\Edge\Application\125.0.2535.67\msedge.exe
    // 或者：C:\Program Files\Microsoft\Edge\Application\msedge.exe
    let path_obj = Path::new(path);

    // 尝试从父目录名获取版本号
    if let Some(parent) = path_obj.parent() {
        let dir_name = parent.file_name().unwrap_or_default().to_string_lossy();
        // 检查是否是版本号格式（包含数字和点）
        if dir_name.chars().any(|c| c.is_numeric()) && dir_name.contains('.') {
            return dir_name.to_string();
        }
    }

    // 如果无法从路径获取，返回 "installed"
    "installed".to_string()
}

/// 获取当前平台的 Edge 路径列表
fn get_edge_paths() -> Vec<&'static str> {
    #[cfg(target_os = "windows")]
    {
        EDGE_PATHS.to_vec()
    }

    #[cfg(target_os = "macos")]
    {
        EDGE_PATHS_MACOS.to_vec()
    }

    #[cfg(target_os = "linux")]
    {
        EDGE_PATHS_LINUX.to_vec()
    }
}

/// 获取 Edge 可执行文件路径
pub fn get_edge_executable_path() -> Result<String, String> {
    detect_edge()
        .map(|info| info.path)
        .ok_or_else(|| "未安装 Edge 浏览器".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_edge() {
        // 这个测试只在安装了 Edge 的系统上通过
        let result = detect_edge();
        println!("Edge detection result: {:?}", result);
    }

    #[test]
    fn test_get_browser_status() {
        let status = get_browser_status();
        println!("Browser status: {:?}", status);
    }
}
