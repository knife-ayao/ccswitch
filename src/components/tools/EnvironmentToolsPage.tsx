import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wrench, Monitor, Package } from "lucide-react";
import { NodeInstaller } from "./NodeInstaller";
import { PythonInstaller } from "./PythonInstaller";
import { GitInstaller } from "./GitInstaller";
import { ClaudeCodeInstaller } from "./ClaudeCodeInstaller";
import { CodexInstaller } from "./CodexInstaller";
import { VSCodeInstaller } from "./VSCodeInstaller";
import { EdgeInstaller } from "./EdgeInstaller";

export function EnvironmentToolsPage() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4"
    >
      {/* 页面标题 */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold">
            {t("tools.title", { defaultValue: "环境工具" })}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("tools.description", {
            defaultValue: "安装和管理开发所需的运行时环境",
          })}
        </p>
      </div>

      {/* 左右布局 */}
      <div className="flex gap-4">
        {/* 左侧：运行环境 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Monitor className="w-3 h-3" />
            <span>{t("tools.runtime", { defaultValue: "运行环境" })}</span>
          </div>
          <div className="space-y-3">
            <NodeInstaller />
            <PythonInstaller />
            <GitInstaller />
          </div>
        </div>

        {/* 右侧：工具安装 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Package className="w-3 h-3" />
            <span>{t("tools.packages", { defaultValue: "工具安装" })}</span>
          </div>
          <div className="space-y-3">
            <ClaudeCodeInstaller />
            <CodexInstaller />
            <VSCodeInstaller />
            <EdgeInstaller />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
