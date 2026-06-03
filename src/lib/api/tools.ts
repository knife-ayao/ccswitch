import { invoke } from "@tauri-apps/api/core";

export interface NodeVersion {
  version: string | null;
  installed: boolean;
  error: string | null;
}

export interface NodeLatestVersion {
  lts: string;
  current: string;
}

export const toolsApi = {
  async getNodeVersion(): Promise<NodeVersion> {
    return await invoke("get_node_version");
  },

  async getNodeLatestVersion(): Promise<NodeLatestVersion> {
    return await invoke("get_node_latest_version");
  },

  async installNodejs(): Promise<string> {
    return await invoke("install_nodejs");
  },

  async updateNodejs(): Promise<string> {
    return await invoke("update_nodejs");
  },
};
