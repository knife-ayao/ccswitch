import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { toolsApi, type GitVersion } from "@/lib/api/tools";

export function GitInstaller() {
  const { t } = useTranslation();
  const [gitInfo, setGitInfo] = useState<GitVersion | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // 检测 Git 版本
  const checkGitVersion = async () => {
    setIsChecking(true);
    try {
      const info = await toolsApi.getGitVersion();
      setGitInfo(info);
    } catch (error) {
      console.error("Failed to check Git:", error);
      setGitInfo({
        installed: false,
        version: null,
        error: String(error),
      });
    } finally {
      setIsChecking(false);
    }
  };

  // 安装 Git
  const installGit = async () => {
    setIsInstalling(true);
    try {
      const result = await toolsApi.installGit();
      toast.success(result);
      await checkGitVersion();
    } catch (error) {
      console.error("Failed to install Git:", error);
      toast.error(String(error));
    } finally {
      setIsInstalling(false);
    }
  };

  // 组件挂载时检测
  useEffect(() => {
    checkGitVersion();
  }, []);

  const isInstalled = gitInfo?.installed ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 92 92"
              className="w-4 h-4"
            >
              <path
                d="M91.2 41.6L50.4 0.8C49.6 0 48.4 0 47.6 0.8L38 10.4L48.4 20.8C49.8 18.8 52.4 18 54.8 18.8C57.2 19.6 58.8 21.6 59.2 24C59.6 26.4 58.8 28.8 57.2 30.4C55.6 32 53.2 32.8 50.8 32.4C48.4 32 46.4 30.4 45.6 28.4L34.4 17.2V43.6C36 44.4 37.2 45.6 38 47.2C38.8 48.8 39.2 50.4 39.2 52.4C39.2 54 39 55.6 38.4 57.2L48.8 67.6C49.6 68.4 50 69.6 50 70.8C50 72 49.6 73.2 48.8 74L48.8 74C48 74.8 46.8 75.2 45.6 75.2C44.4 75.2 43.2 74.8 42.4 74L32 63.6C31.2 64.4 30 65.2 28.8 65.6C27.2 66.4 25.6 66.8 24 66.8C22 66.8 20 66.4 18.4 65.6C16.8 64.8 15.2 63.6 14.4 62C13.6 60.4 13.2 58.8 13.2 57.2C13.2 55.6 13.6 54 14.4 52.4C15.2 50.8 16.8 49.6 18.4 48.8C20 48 21.6 47.6 24 47.6C25.6 47.6 27.2 48 28.8 48.8L38.8 59.2V32.4C37.2 31.6 36 30.4 35.2 28.8C34.4 27.2 34 25.6 34 24C34 22 34.4 20 35.2 18.4L24.8 8H0V24H10.4L21.2 34.8V51.2L10.4 62V84H38V67.6L47.6 77.2C48.4 78 49.6 78.4 50.8 78.4C52 78.4 53.2 78 54 77.2L54 77.2C54.8 76.4 55.2 75.2 55.2 74C55.2 72.8 54.8 71.6 54 70.8L43.6 60.4V56.4C44.4 56.8 45.2 57.2 46.4 57.2C47.6 57.2 48.8 57 50 56.4L50 56.4C51.2 55.8 52.4 55 53.2 54C54 53 54.8 52 55.2 50.8C55.6 49.6 56 48.4 56 47.2C56 46 55.6 44.8 55.2 43.6L91.2 41.6Z"
                fill="#F05032"
              />
            </svg>
            Git
          </CardTitle>
          <CardDescription className="text-xs">
            {t("tools.git.description", {
              defaultValue: "分布式版本控制系统，开发者必备工具",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : isInstalled ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}

              <div>
                {isChecking ? (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.git.checking", {
                      defaultValue: "检查中...",
                    })}
                  </div>
                ) : isInstalled ? (
                  <div className="text-xs font-medium text-green-500">
                    {t("tools.git.installed", {
                      defaultValue: "已安装 {{version}}",
                      version: gitInfo?.version,
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.git.notInstalled", {
                      defaultValue: "未安装",
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={checkGitVersion}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
                />
                {t("tools.git.refresh", { defaultValue: "刷新" })}
              </Button>

              {!isInstalled && (
                <Button
                  className="h-7 text-xs px-2"
                  onClick={installGit}
                  disabled={isInstalling}
                >
                  {isInstalling ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  {isInstalling
                    ? t("tools.git.installing", {
                        defaultValue: "安装中...",
                      })
                    : t("tools.git.install", {
                        defaultValue: "一键安装",
                      })}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
