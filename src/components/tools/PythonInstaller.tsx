import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  ArrowUpCircle,
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
import {
  toolsApi,
  type PythonStatus,
  type PythonLatestVersion,
} from "@/lib/api/tools";

// Python 版本状态类型
type PythonEnvStatus =
  | "checking"
  | "not_found"
  | "outdated"
  | "healthy";

export function PythonInstaller() {
  const { t } = useTranslation();
  const [pythonStatus, setPythonStatus] = useState<PythonStatus | null>(null);
  const [latestVersion, setLatestVersion] =
    useState<PythonLatestVersion | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // 计算版本状态
  const envStatus: PythonEnvStatus = useMemo(() => {
    if (isChecking) return "checking";
    if (!pythonStatus) return "checking";
    if (!pythonStatus.found) return "not_found";
    if (!pythonStatus.isLatest) return "outdated";
    return "healthy";
  }, [pythonStatus, isChecking]);

  // 检查 Python 环境
  const checkPythonEnvironment = async () => {
    setIsChecking(true);
    try {
      const [status, latest] = await Promise.all([
        toolsApi.checkPythonEnvironment(),
        toolsApi.getPythonLatestVersion(),
      ]);

      setPythonStatus(status);
      setLatestVersion(latest);
    } catch (error) {
      console.error("Failed to check Python environment:", error);
      setPythonStatus({
        found: false,
        version: null,
        isLatest: false,
        message: String(error),
      });
    } finally {
      setIsChecking(false);
    }
  };

  // 安装/更新 Python
  const installPython = async () => {
    setIsInstalling(true);
    try {
      const result = await toolsApi.installPython();
      toast.success(result);
      await checkPythonEnvironment();
    } catch (error) {
      console.error("Failed to install Python:", error);
      toast.error(String(error));
    } finally {
      setIsInstalling(false);
    }
  };

  // 组件挂载时检查环境
  useEffect(() => {
    checkPythonEnvironment();
  }, []);

  // 获取状态颜色
  const getStatusColor = () => {
    switch (envStatus) {
      case "not_found":
        return "text-muted-foreground";
      case "outdated":
        return "text-yellow-500";
      case "healthy":
        return "text-green-500";
      case "checking":
        return "text-muted-foreground";
    }
  };

  // 获取状态图标
  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }

    switch (envStatus) {
      case "not_found":
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      case "outdated":
        return <ArrowUpCircle className="w-5 h-5 text-yellow-500" />;
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "checking":
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    if (isChecking) {
      return t("tools.python.checking", { defaultValue: "检查中..." });
    }

    switch (envStatus) {
      case "not_found":
        return t("tools.python.notFound", { defaultValue: "未找到 Python" });
      case "outdated":
        return t("tools.python.outdated", {
          defaultValue: "版本过低: {{version}}",
          version: pythonStatus?.version,
        });
      case "healthy":
        return t("tools.python.isLatest", {
          defaultValue: "已是最新版本: {{version}}",
          version: pythonStatus?.version,
        });
      case "checking":
        return "";
    }
  };

  // 获取操作按钮
  const getActionButton = () => {
    if (isChecking) {
      return null;
    }

    const btnClass = "h-7 text-xs px-2";

    switch (envStatus) {
      case "not_found":
        return (
          <Button className={btnClass} onClick={installPython} disabled={isInstalling}>
            {isInstalling ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Download className="w-3 h-3 mr-1" />
            )}
            {isInstalling
              ? t("tools.python.installing", { defaultValue: "安装中..." })
              : t("tools.python.install", { defaultValue: "安装" })}
          </Button>
        );

      case "outdated":
        return (
          <Button className={btnClass} onClick={installPython} disabled={isInstalling}>
            {isInstalling ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <ArrowUpCircle className="w-3 h-3 mr-1" />
            )}
            {isInstalling
              ? t("tools.python.updating", { defaultValue: "更新中..." })
              : t("tools.python.updateTo", {
                  defaultValue: "更新到 {{version}}",
                  version: latestVersion?.stable,
                })}
          </Button>
        );

      case "healthy":
      case "checking":
        return null;
    }
  };

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
              src="https://www.python.org/static/community_logos/python-logo-generic.svg"
              alt="Python"
              className="w-4 h-4"
              onError={(e) => {
                // 如果 logo 加载失败，使用文字替代
                e.currentTarget.style.display = "none";
              }}
            />
            Python
          </CardTitle>
          <CardDescription className="text-xs">
            {t("tools.python.description", {
              defaultValue:
                "Python 运行时环境，Claude Code 调用 Python 库的前置依赖",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}

              <div>
                <div className={`text-xs font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </div>

                {latestVersion && envStatus !== "not_found" && (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.python.latestVersion", {
                      defaultValue: "最新版本: {{version}}",
                      version: latestVersion.stable,
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
                onClick={checkPythonEnvironment}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
                />
                {t("tools.python.refresh", { defaultValue: "刷新" })}
              </Button>

              {getActionButton()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
