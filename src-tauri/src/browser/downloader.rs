/**
 * 浏览器下载模块
 *
 * 从微软官方源下载 Edge 浏览器安装包
 */

use anyhow::{Context, Result};
use futures_util::StreamExt;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

/// Edge 下载链接（Windows 64位 MSI）
const EDGE_DOWNLOAD_URL_X64: &str = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/msedge/package/MicrosoftEdgeEnterpriseX64.msi";

/// Edge 下载链接（Windows 32位 MSI）
const EDGE_DOWNLOAD_URL_X86: &str = "https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/msedge/package/MicrosoftEdgeEnterpriseX86.msi";

/// Edge 下载链接（macOS PKG）
#[cfg(target_os = "macos")]
const EDGE_DOWNLOAD_URL_MACOS: &str = "https://officecdnmac.microsoft.com/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdge.pkg";

/// 获取下载链接
fn get_download_url() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        if cfg!(target_arch = "x86_64") || cfg!(target_arch = "x86") {
            // 检测系统架构
            if std::env::var("PROCESSOR_ARCHITECTURE").unwrap_or_default() == "AMD64"
                || std::env::var("PROCESSOR_ARCHITEW6432").unwrap_or_default() == "AMD64"
            {
                EDGE_DOWNLOAD_URL_X64
            } else {
                EDGE_DOWNLOAD_URL_X86
            }
        } else {
            EDGE_DOWNLOAD_URL_X64
        }
    }

    #[cfg(target_os = "macos")]
    {
        EDGE_DOWNLOAD_URL_MACOS
    }

    #[cfg(target_os = "linux")]
    {
        // Linux 通常通过包管理器安装，这里提供一个备用链接
        "https://packages.microsoft.com/repos/edge/pool/main/m/microsoft-edge-stable/"
    }
}

/// 获取安装包保存路径
fn get_installer_path() -> PathBuf {
    let filename = if cfg!(target_os = "windows") {
        "edge_installer.msi"
    } else if cfg!(target_os = "macos") {
        "edge_installer.pkg"
    } else {
        "edge_installer.deb"
    };

    std::env::temp_dir().join(filename)
}

/// 下载进度回调类型
pub type ProgressCallback = Box<dyn Fn(f64) + Send + 'static>;

/// 下载 Edge 安装包
///
/// # Arguments
/// * `progress_callback` - 下载进度回调，参数为 0.0-1.0 的进度值
///
/// # Returns
/// 安装包的本地路径
pub async fn download_edge(
    progress_callback: impl Fn(f64) + Send + 'static,
) -> Result<PathBuf> {
    let url = get_download_url();
    let save_path = get_installer_path();

    log::info!("开始下载 Edge 浏览器: {}", url);
    log::info!("保存路径: {:?}", save_path);

    // 创建 HTTP 客户端
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(300)) // 5分钟超时
        .build()
        .context("创建 HTTP 客户端失败")?;

    // 发起下载请求
    let response = client
        .get(url)
        .send()
        .await
        .context("发起下载请求失败")?;

    // 检查响应状态
    if !response.status().is_success() {
        anyhow::bail!("下载失败，服务器返回状态码: {}", response.status());
    }

    // 获取文件大小
    let total_size = response.content_length().unwrap_or(0);
    log::info!("文件大小: {} bytes", total_size);

    // 创建文件
    let mut file = File::create(&save_path)
        .context("创建安装包文件失败")?;

    // 下载文件
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.context("读取下载数据失败")?;
        file.write_all(&chunk).context("写入文件失败")?;
        downloaded += chunk.len() as u64;

        // 报告进度
        if total_size > 0 {
            let progress = downloaded as f64 / total_size as f64;
            progress_callback(progress);
        }
    }

    // 确保文件写入完成
    file.flush().context("刷新文件缓冲区失败")?;

    log::info!("Edge 下载完成: {:?}", save_path);

    Ok(save_path)
}

/// 检查安装包是否存在
pub fn installer_exists() -> bool {
    get_installer_path().exists()
}

/// 获取安装包路径
pub fn get_installer_file_path() -> PathBuf {
    get_installer_path()
}

/// 删除安装包
pub fn cleanup_installer() -> Result<()> {
    let path = get_installer_path();
    if path.exists() {
        std::fs::remove_file(&path)
            .context("删除安装包失败")?;
        log::info!("已删除安装包: {:?}", path);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_download_url() {
        let url = get_download_url();
        println!("Download URL: {}", url);
        assert!(!url.is_empty());
    }

    #[test]
    fn test_get_installer_path() {
        let path = get_installer_path();
        println!("Installer path: {:?}", path);
    }
}
