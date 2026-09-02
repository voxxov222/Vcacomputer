// VCA OS — Real Local Computing Runtime Client SDK

import {
  RuntimeSystemInfo,
  TerminalExecutionRequest,
  TerminalExecutionResult,
  RealProcessItem,
  PortBindingInfo,
  RealFileItem,
  ProjectDetectionResult,
  GitHubProjectRunPlan,
  InstalledApplication,
  DynamicWidgetConfig,
  ToolRegistryItem,
  SecurityApprovalRequest
} from '../types/runtime';

class RuntimeApiClient {
  private baseUrl = '/api';

  // --- 1. RUNTIME & SYSTEM INFO ---
  async getSystemInfo(): Promise<RuntimeSystemInfo> {
    const res = await fetch(`${this.baseUrl}/runtime/info`);
    if (!res.ok) throw new Error(`Runtime query failed: ${res.statusText}`);
    return res.json();
  }

  async getCapabilities(): Promise<{ tools: ToolRegistryItem[]; securityMode: string }> {
    const res = await fetch(`${this.baseUrl}/runtime/capabilities`);
    if (!res.ok) throw new Error(`Capabilities query failed: ${res.statusText}`);
    return res.json();
  }

  // --- 2. REAL TERMINAL EXECUTION ---
  async executeCommand(req: TerminalExecutionRequest): Promise<TerminalExecutionResult> {
    const res = await fetch(`${this.baseUrl}/terminal/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Command execution failed');
    }
    return res.json();
  }

  async getTerminalSessions(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/terminal/sessions`);
    if (!res.ok) return [];
    return res.json();
  }

  async killProcess(pid: number, signal: string = 'SIGTERM'): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${this.baseUrl}/terminal/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pid, signal })
    });
    return res.json();
  }

  // --- 3. REAL PROCESS & PORT MANAGEMENT ---
  async getProcesses(): Promise<RealProcessItem[]> {
    const res = await fetch(`${this.baseUrl}/processes`);
    if (!res.ok) throw new Error('Failed to fetch processes');
    const data = await res.json();
    return data.processes || [];
  }

  async getPorts(): Promise<PortBindingInfo[]> {
    const res = await fetch(`${this.baseUrl}/ports`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.ports || [];
  }

  async stopProcess(pid: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${this.baseUrl}/processes/${pid}/stop`, { method: 'POST' });
    return res.json();
  }

  async restartProcess(pid: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${this.baseUrl}/processes/${pid}/restart`, { method: 'POST' });
    return res.json();
  }

  // --- 4. REAL FILESYSTEM MANAGEMENT ---
  async listFiles(dirPath: string = '.', showHidden: boolean = true): Promise<{ path: string; items: RealFileItem[]; parent: string }> {
    const params = new URLSearchParams({ path: dirPath, showHidden: String(showHidden) });
    const res = await fetch(`${this.baseUrl}/files/list?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to list files');
    return res.json();
  }

  async readFile(filePath: string): Promise<{ content: string; path: string; size: number; mimeType?: string; isBinary?: boolean }> {
    const params = new URLSearchParams({ path: filePath });
    const res = await fetch(`${this.baseUrl}/files/read?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to read file: ${filePath}`);
    return res.json();
  }

  async writeFile(filePath: string, content: string): Promise<{ success: boolean; path: string; size: number }> {
    const res = await fetch(`${this.baseUrl}/files/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content })
    });
    if (!res.ok) throw new Error(`Failed to write file: ${filePath}`);
    return res.json();
  }

  async createFileOrFolder(filePath: string, isDirectory: boolean = false, initialContent: string = ''): Promise<{ success: boolean; path: string }> {
    const res = await fetch(`${this.baseUrl}/files/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, isDirectory, content: initialContent })
    });
    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  }

  async uploadFile(targetDir: string, filename: string, content: string, isBase64: boolean = false): Promise<{ success: boolean; path: string; filename: string }> {
    const res = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetDir, filename, content, isBase64 })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Failed to upload file');
    }
    return res.json();
  }

  async uploadWallpaper(filename: string, content: string, mimeType: string): Promise<{ success: boolean; path: string; dataUrl: string; url: string }> {
    const res = await fetch(`${this.baseUrl}/wallpaper/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content, mimeType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Failed to upload wallpaper');
    }
    return res.json();
  }

  async deleteFileOrFolder(filePath: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch(`${this.baseUrl}/files/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath })
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return res.json();
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/files/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourcePath, destination: destinationPath })
    });
    if (!res.ok) throw new Error('Failed to move item');
    return res.json();
  }

  async copyFile(sourcePath: string, destinationPath: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/files/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourcePath, destination: destinationPath })
    });
    if (!res.ok) throw new Error('Failed to copy item');
    return res.json();
  }

  async searchFiles(query: string, rootDir: string = '.'): Promise<RealFileItem[]> {
    const res = await fetch(`${this.baseUrl}/files/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, rootDir })
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  }

  // --- 5. ARCHIVES (ZIP / TAR) ---
  async extractArchive(archivePath: string, destinationDir: string = '.'): Promise<{ success: boolean; filesExtracted: number; logs: string[] }> {
    const res = await fetch(`${this.baseUrl}/archive/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivePath, destinationDir })
    });
    if (!res.ok) throw new Error('Archive extraction failed');
    return res.json();
  }

  async createArchive(sourcePaths: string[], outputArchiveName: string, format: 'zip' | 'tar' | 'tar.gz' = 'zip'): Promise<{ success: boolean; archivePath: string; sizeBytes: number }> {
    const res = await fetch(`${this.baseUrl}/archive/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources: sourcePaths, outputName: outputArchiveName, format })
    });
    if (!res.ok) throw new Error('Archive creation failed');
    return res.json();
  }

  // --- 6. GITHUB & PROJECT RUNNER ---
  async cloneGitHubRepo(repoUrl: string, destinationName?: string): Promise<{ success: boolean; projectPath: string; projectName: string; logs: string[] }> {
    const res = await fetch(`${this.baseUrl}/git/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, destinationName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Clone failed' }));
      throw new Error(err.error || 'Failed to clone repository');
    }
    return res.json();
  }

  async detectProject(projectPath: string): Promise<ProjectDetectionResult> {
    const res = await fetch(`${this.baseUrl}/projects/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath })
    });
    if (!res.ok) throw new Error('Failed to detect project specifications');
    return res.json();
  }

  async installProjectDependencies(projectPath: string): Promise<{ success: boolean; logs: string[]; durationMs: number }> {
    const res = await fetch(`${this.baseUrl}/projects/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath })
    });
    if (!res.ok) throw new Error('Dependency installation failed');
    return res.json();
  }

  async buildProject(projectPath: string): Promise<{ success: boolean; logs: string[]; durationMs: number }> {
    const res = await fetch(`${this.baseUrl}/projects/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath })
    });
    if (!res.ok) throw new Error('Build failed');
    return res.json();
  }

  async launchProject(projectPath: string, customPort?: number): Promise<{ success: boolean; pid: number; port: number; url: string; logs: string[] }> {
    const res = await fetch(`${this.baseUrl}/projects/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath, port: customPort })
    });
    if (!res.ok) throw new Error('Project launch failed');
    return res.json();
  }

  // --- 7. PACKAGES & SOFTWARE MANAGEMENT ---
  async detectPackageManagers(): Promise<{ available: Record<string, boolean>; details: Record<string, string> }> {
    const res = await fetch(`${this.baseUrl}/packages/detect`);
    if (!res.ok) throw new Error('Failed to detect packages');
    return res.json();
  }

  async installPackage(pkgName: string, manager?: string): Promise<{ success: boolean; logs: string[]; exitCode: number }> {
    const res = await fetch(`${this.baseUrl}/packages/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package: pkgName, manager })
    });
    return res.json();
  }

  // --- 8. APPLICATIONS & LAUNCHER ---
  async getApplications(): Promise<InstalledApplication[]> {
    const res = await fetch(`${this.baseUrl}/apps`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.apps || [];
  }

  async launchApplication(appId: string): Promise<{ success: boolean; pid?: number; port?: number; message: string }> {
    const res = await fetch(`${this.baseUrl}/apps/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId })
    });
    return res.json();
  }

  async stopApplication(appId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/apps/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId })
    });
    return res.json();
  }

  // --- 9. DYNAMIC WIDGETS ---
  async getWidgets(): Promise<DynamicWidgetConfig[]> {
    const res = await fetch(`${this.baseUrl}/widgets`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.widgets || [];
  }

  async saveWidget(widget: DynamicWidgetConfig): Promise<{ success: boolean; widget: DynamicWidgetConfig }> {
    const res = await fetch(`${this.baseUrl}/widgets/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(widget)
    });
    return res.json();
  }

  async updateWidget(widgetId: string, updates: Partial<DynamicWidgetConfig>): Promise<{ success: boolean; widget: DynamicWidgetConfig }> {
    const res = await fetch(`${this.baseUrl}/widgets/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: widgetId, updates })
    });
    return res.json();
  }

  async deleteWidget(widgetId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.baseUrl}/widgets/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: widgetId })
    });
    return res.json();
  }
}

export const runtimeApi = new RuntimeApiClient();
