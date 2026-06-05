import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toolsApi, type NodeVersion, type NodeLatestVersion } from "@/lib/api/tools";

// Claude Code 最低要求
const MIN_NODE_VERSION = 18;

// 解析版本号（如 "v20.11.0" -> [20, 11, 0]）
function parseVersion(version: string): [number, number, number] {
  const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

// 版本状态类型
type NodeStatus =
  | "not_installed"
  | "too_old"
  | "outdated"
  | "up_to_date"
  | "checking";

export function NodeInstaller() {
  const { t } = useTranslation();
  const [nodeVersion, setNodeVersion] = useState<NodeVersion | null>(null);
  const [latestVersion, setLatestVersion] = useState<NodeLatestVersion | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 计算版本状态
  const nodeStatus: NodeStatus = useMemo(() => {
    if (isChecking) return "checking";
    if (!nodeVersion?.installed) return "not_installed";
    if (!latestVersion) return "checking";

    const current = nodeVersion.version!;
    const [currentMajor] = parseVersion(current);

    // 检查是否低于最低要求
    if (currentMajor < MIN_NODE_VERSION) {
      return "too_old";
    }

    // 检查是否可更新
    const [currentMinor, currentPatch] = parseVersion(current).slice(1) as [number, number];
    const [latestMajor, latestMinor, latestPatch] = parseVersion(latestVersion.lts);

    if (
      currentMajor < latestMajor ||
      (currentMajor === latestMajor && currentMinor < latestMinor) ||
      (currentMajor === latestMajor && currentMinor === latestMinor && currentPatch < latestPatch)
    ) {
      return "outdated";
    }

    return "up_to_date";
  }, [nodeVersion, latestVersion, isChecking]);

  // 检查 Node.js 版本
  const checkNodeVersion = async () => {
    setIsChecking(true);
    try {
      const [version, latest] = await Promise.all([
        toolsApi.getNodeVersion(),
        toolsApi.getNodeLatestVersion(),
      ]);
      setNodeVersion(version);
      setLatestVersion(latest);
    } catch (error) {
      console.error("Failed to check Node.js version:", error);
      setNodeVersion({
        version: null,
        installed: false,
        error: String(error),
      });
    } finally {
      setIsChecking(false);
    }
  };

  // 安装 Node.js
  const installNodejs = async () => {
    setIsInstalling(true);
    try {
      const result = await toolsApi.installNodejs();
      toast.success(result);
      await checkNodeVersion();
    } catch (error) {
      console.error("Failed to install Node.js:", error);
      toast.error(String(error));
    } finally {
      setIsInstalling(false);
    }
  };

  // 更新 Node.js
  const updateNodejs = async () => {
    setIsUpdating(true);
    try {
      const result = await toolsApi.updateNodejs();
      toast.success(result);
      await checkNodeVersion();
    } catch (error) {
      console.error("Failed to update Node.js:", error);
      toast.error(String(error));
    } finally {
      setIsUpdating(false);
    }
  };

  // 组件挂载时检查版本
  useEffect(() => {
    checkNodeVersion();
  }, []);

  // 获取状态颜色
  const getStatusColor = () => {
    switch (nodeStatus) {
      case "not_installed":
        return "text-muted-foreground";
      case "too_old":
        return "text-red-500";
      case "outdated":
        return "text-yellow-500";
      case "up_to_date":
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

    switch (nodeStatus) {
      case "not_installed":
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      case "too_old":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "outdated":
        return <ArrowUpCircle className="w-5 h-5 text-yellow-500" />;
      case "up_to_date":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "checking":
        return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    if (isChecking) {
      return t("tools.nodejs.checking", { defaultValue: "检查中..." });
    }

    switch (nodeStatus) {
      case "not_installed":
        return t("tools.nodejs.notInstalled", { defaultValue: "未安装" });
      case "too_old":
        return t("tools.nodejs.tooOld", {
          defaultValue: "版本过低: {{version}} (需要 >= {{minVersion}})",
          version: nodeVersion?.version,
          minVersion: MIN_NODE_VERSION,
        });
      case "outdated":
        return t("tools.nodejs.installed", {
          defaultValue: "已安装 {{version}}",
          version: nodeVersion?.version,
        });
      case "up_to_date":
        return t("tools.nodejs.latest", {
          defaultValue: "已是最新版本: {{version}}",
          version: nodeVersion?.version,
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

    switch (nodeStatus) {
      case "not_installed":
        return (
          <Button className={btnClass} onClick={installNodejs} disabled={isInstalling}>
            {isInstalling ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Download className="w-3 h-3 mr-1" />
            )}
            {isInstalling
              ? t("tools.nodejs.installing", { defaultValue: "安装中..." })
              : t("tools.nodejs.install", { defaultValue: "一键安装" })}
          </Button>
        );

      case "too_old":
        return (
          <Button className={btnClass} variant="destructive" onClick={updateNodejs} disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <ArrowUpCircle className="w-3 h-3 mr-1" />
            )}
            {isUpdating
              ? t("tools.nodejs.updating", { defaultValue: "更新中..." })
              : t("tools.nodejs.updateNow", {
                  defaultValue: "立即更新到 {{version}}",
                  version: latestVersion?.lts,
                })}
          </Button>
        );

      case "outdated":
        return (
          <Button className={btnClass} onClick={updateNodejs} disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <ArrowUpCircle className="w-3 h-3 mr-1" />
            )}
            {isUpdating
              ? t("tools.nodejs.updating", { defaultValue: "更新中..." })
              : t("tools.nodejs.updateTo", {
                  defaultValue: "更新到 {{version}}",
                  version: latestVersion?.lts,
                })}
          </Button>
        );

      case "up_to_date":
        return null; // 最新版本不显示按钮

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
      <Card
        className={
          nodeStatus === "too_old"
            ? "border-red-500 bg-red-50 dark:bg-red-950/20"
            : ""
        }
      >
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <img
              src="https://nodejs.org/static/images/logo.svg"
              alt="Node.js"
              className="w-4 h-4"
            />
            Node.js
            {nodeStatus === "too_old" && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                {t("tools.nodejs.requiresUpdate", {
                  defaultValue: "需要更新",
                })}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("tools.nodejs.description", {
              defaultValue:
                "JavaScript 运行时环境，Claude Code、Codex 等工具的前置依赖",
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

                {latestVersion && nodeStatus !== "not_installed" && (
                  <div className="text-xs text-muted-foreground">
                    {t("tools.nodejs.latestLts", {
                      defaultValue: "最新 LTS: {{version}}",
                      version: latestVersion.lts,
                    })}
                  </div>
                )}

                {nodeStatus === "too_old" && (
                  <div className="text-xs text-red-500">
                    {t("tools.nodejs.tooOldWarning", {
                      defaultValue:
                        "当前版本无法运行 Claude Code，请立即更新！",
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
                onClick={checkNodeVersion}
                disabled={isChecking}
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
                />
                {t("tools.nodejs.refresh", { defaultValue: "刷新" })}
              </Button>

              {getActionButton()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
