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

export interface PythonStatus {
  found: boolean;
  version: string | null;
  isLatest: boolean;
  message: string;
}

export interface PythonLatestVersion {
  stable: string;
}

export interface GitVersion {
  installed: boolean;
  version: string | null;
  error: string | null;
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

  async checkPythonEnvironment(): Promise<PythonStatus> {
    return await invoke("check_python_environment");
  },

  async getPythonLatestVersion(): Promise<PythonLatestVersion> {
    return await invoke("get_python_latest_version");
  },

  async installPython(): Promise<string> {
    return await invoke("install_python");
  },

  async reinstallPython(): Promise<string> {
    return await invoke("reinstall_python");
  },

  async getGitVersion(): Promise<GitVersion> {
    return await invoke("get_git_version");
  },

  async installGit(): Promise<string> {
    return await invoke("install_git");
  },
};
