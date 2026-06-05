import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { toast } from "sonner";
import { Globe, Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EdgeInstaller() {
  const { t } = useTranslation();
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 检测浏览器是否安装
  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await invoke<{ installed: boolean }>("check_browser");
      setIsInstalled(result.installed);
    } catch (error) {
      console.error("检测浏览器失败:", error);
      setIsInstalled(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // 初始检测
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 监听下载进度
  useEffect(() => {
    const unlisten = listen<number>("browser-download-progress", (event) => {
      setProgress(Math.round(event.payload * 100));
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // 一键下载安装
  const handleInstall = async () => {
    setIsDownloading(true);
    setProgress(0);

    try {
      await invoke("download_and_install_browser");
      toast.success("Edge 浏览器安装成功！");
      setIsInstalled(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes("已安装")) {
        setIsInstalled(true);
      } else {
        toast.error("安装失败: " + errorMsg);
      }
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Globe className="w-4 h-4" />
          Edge 浏览器
        </CardTitle>
        <CardDescription className="text-xs">
          {t("browser.description", {
            defaultValue: "Claude Code 可操控的浏览器",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isChecking ? (
              "检查中..."
            ) : isInstalled ? (
              <span className="text-green-500 font-medium">已安装</span>
            ) : (
              "未安装"
            )}
          </div>

          <div className="flex gap-1">
            {isInstalled ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={checkStatus}
                disabled={isChecking}
              >
                <RefreshCw
                  className={cn("w-3 h-3", isChecking && "animate-spin")}
                />
              </Button>
            ) : (
              <Button
                className="h-7 text-xs px-2"
                onClick={handleInstall}
                disabled={isDownloading || isChecking}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    下载中 {progress}%
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    一键安装
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* 下载进度条 */}
        {isDownloading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
