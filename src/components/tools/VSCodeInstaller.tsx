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
import { invoke } from "@tauri-apps/api/core";

interface VSCodeStatus {
  found: boolean;
  version: string | null;
  latestVersion: string | null;
}

export function VSCodeInstaller() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<VSCodeStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // 检测 VS Code 版本
  const checkVSCode = async () => {
    setIsChecking(true);
    try {
      const result = await invoke<VSCodeStatus>("check_vscode");
      setStatus(result);
    } catch (error) {
      console.error("Failed to check VS Code:", error);
      setStatus({ found: false, version: null, latestVersion: null });
    } finally {
      setIsChecking(false);
    }
  };

  // 安装 VS Code
  const installVSCode = async () => {
    setIsInstalling(true);
    try {
      const result = await invoke<string>("install_vscode");
      toast.success(result);
      await checkVSCode();
    } catch (error) {
      console.error("Failed to install VS Code:", error);
      toast.error(String(error));
    } finally {
      setIsInstalling(false);
    }
  };

  // 组件挂载时检测
  useEffect(() => {
    checkVSCode();
  }, []);

  const isInstalled = status?.found ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <img
              src="https://code.visualstudio.com/favicon.ico"
              alt="VS Code"
              className="w-4 h-4"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            VS Code
          </CardTitle>
          <CardDescription className="text-xs">
            {t("tools.vscode.description", {
              defaultValue: "微软代码编辑器",
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
                    {t("tools.vscode.checking", {
                      defaultValue: "检查中...",
                    })}
                  </div>
                ) : isInstalled ? (
                  <div className="text-xs font-medium text-green-500">
                    {t("tools.vscode.installed", {
                      defaultValue: "已安装 {{version}}",
                      version: status?.version,
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.vscode.notInstalled", {
                      defaultValue: "未安装",
                    })}
                  </div>
                )}

                {status?.latestVersion && (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.vscode.latestVersion", {
                      defaultValue: "最新版本: {{version}}",
                      version: status.latestVersion,
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
                onClick={checkVSCode}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
                />
                {t("tools.vscode.refresh", { defaultValue: "刷新" })}
              </Button>

              {!isInstalled && (
                <Button
                  className="h-7 text-xs px-2"
                  onClick={installVSCode}
                  disabled={isInstalling}
                >
                  {isInstalling ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  {isInstalling
                    ? t("tools.vscode.installing", {
                        defaultValue: "安装中...",
                      })
                    : t("tools.vscode.install", {
                        defaultValue: "安装",
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
