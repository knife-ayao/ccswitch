import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { NodeInstaller } from "./NodeInstaller";

export function EnvironmentToolsPage() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* 页面标题 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {t("tools.title", { defaultValue: "环境工具" })}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("tools.description", {
            defaultValue: "安装和管理开发所需的运行时环境",
          })}
        </p>
      </div>

      {/* 工具列表 */}
      <div className="grid gap-4">
        <NodeInstaller />
        {/* 未来可以添加更多工具，如 Python、Rust 等 */}
      </div>
    </motion.div>
  );
}
