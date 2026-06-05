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
import { settingsApi } from "@/lib/api/settings";

interface ToolInfo {
  name: string;
  version: string | null;
  latest_version: string | null;
  error: string | null;
  installed_but_broken: boolean;
}

export function ClaudeCodeInstaller() {
  const { t } = useTranslation();
  const [toolInfo, setToolInfo] = useState<ToolInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // 检测 Claude Code 版本
  const checkClaudeCode = async () => {
    setIsChecking(true);
    try {
      const results = await settingsApi.getToolVersions(["claude"]);
      const claudeInfo = results.find((r) => r.name === "claude");
      setToolInfo(claudeInfo || null);
    } catch (error) {
      console.error("Failed to check Claude Code:", error);
      setToolInfo(null);
    } finally {
      setIsChecking(false);
    }
  };

  // 安装 Claude Code
  const installClaudeCode = async () => {
    setIsInstalling(true);
    try {
      await settingsApi.runToolLifecycleAction(["claude"], "install");
      toast.success(
        t("tools.claudeCode.installSuccess", {
          defaultValue: "Claude Code 安装成功！",
        })
      );
      await checkClaudeCode();
    } catch (error) {
      console.error("Failed to install Claude Code:", error);
      toast.error(String(error));
    } finally {
      setIsInstalling(false);
    }
  };

  // 组件挂载时检测
  useEffect(() => {
    checkClaudeCode();
  }, []);

  const isInstalled = toolInfo?.version != null;
  const isBroken = toolInfo?.installed_but_broken ?? false;

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
              src="https://claude.ai/favicon.ico"
              alt="Claude Code"
              className="w-4 h-4"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            Claude Code CLI
          </CardTitle>
          <CardDescription className="text-xs">
            {t("tools.claudeCode.description", {
              defaultValue: "Anthropic 官方 CLI 工具",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isChecking ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : isInstalled && !isBroken ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}

              <div>
                {isChecking ? (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.claudeCode.checking", {
                      defaultValue: "检查中...",
                    })}
                  </div>
                ) : isInstalled ? (
                  <div className="text-xs font-medium text-green-500">
                    {t("tools.claudeCode.installed", {
                      defaultValue: "已安装 {{version}}",
                      version: toolInfo.version,
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.claudeCode.notInstalled", {
                      defaultValue: "未安装",
                    })}
                  </div>
                )}

                {toolInfo?.latest_version && (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.claudeCode.latestVersion", {
                      defaultValue: "最新版本: {{version}}",
                      version: toolInfo.latest_version,
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
                onClick={checkClaudeCode}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
                />
                {t("tools.claudeCode.refresh", { defaultValue: "刷新" })}
              </Button>

              {!isInstalled && (
                <Button
                  className="h-7 text-xs px-2"
                  onClick={installClaudeCode}
                  disabled={isInstalling}
                >
                  {isInstalling ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  {isInstalling
                    ? t("tools.claudeCode.installing", {
                        defaultValue: "安装中...",
                      })
                    : t("tools.claudeCode.install", {
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
