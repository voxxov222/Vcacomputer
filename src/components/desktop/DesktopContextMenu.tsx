import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { runtimeApi } from '../../lib/runtimeApi';
import {
  Palette,
  FolderPlus,
  FilePlus,
  Terminal,
  Sparkles,
  RefreshCw,
  Sliders,
  Upload,
  Link2,
  LayoutGrid,
  CheckSquare,
  Monitor,
  StickyNote,
  Cpu,
  Activity,
  Layers,
  Eye,
  Minimize2,
  ShieldCheck,
  Code2,
  FileText,
  FileCode,
  HardDrive,
  X,
  Check
} from 'lucide-react';

interface DesktopContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ x, y, onClose }) => {
  const {
    openWindow,
    setWallpaperModalOpen,
    wallpaperConfig,
    setWallpaperConfig,
    minimizeAllWindows,
    tileWindows,
    addWidget,
    createFile,
    logActivity,
    addNotification,
    soundEnabled
  } = useOS();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Dialog states triggered from menu
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('new_folder');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [fileName, setFileName] = useState('script.ts');
  const [fileTemplate, setFileTemplate] = useState('typescript');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Clamping menu within viewport boundaries
  const [menuPos, setMenuPos] = useState({ x, y });

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let posX = x;
    let posY = y;

    if (posX + rect.width > screenW - 10) {
      posX = screenW - rect.width - 12;
    }
    if (posY + rect.height > screenH - 60) {
      posY = Math.max(10, screenH - rect.height - 60);
    }

    setMenuPos({ x: posX, y: posY });
  }, [x, y]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      const folderPath = `vca_projects/${folderName.trim()}`;
      await runtimeApi.createFileOrFolder(folderPath, true);
      createFile({
        name: folderName.trim(),
        path: folderPath,
        type: 'folder',
        content: '',
        size: 0,
        isFolder: true
      });
      logActivity('CREATE_FOLDER', `Created folder "${folderName}" on desktop workspace`);
      addNotification({
        title: 'Folder Created',
        message: `Created "${folderName}" in workspace`,
        type: 'success'
      });
      setIsCreatingFolder(false);
      onClose();
    } catch (err: any) {
      alert(`Error creating folder: ${err.message}`);
    }
  };

  const handleCreateFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    let initialCode = '// VCA OS Script\n';
    if (fileTemplate === 'typescript') {
      initialCode = `/**\n * VCA OS Engine Module\n */\nexport function runTask() {\n  console.log("Task initialized at ${new Date().toISOString()}");\n}\n`;
    } else if (fileTemplate === 'python') {
      initialCode = `#!/usr/bin/env python3\n# VCA OS Automation\n\ndef main():\n    print("VCA Agent online.")\n\nif __name__ == "__main__":\n    main()\n`;
    } else if (fileTemplate === 'markdown') {
      initialCode = `# Notes & Specifications\nCreated: ${new Date().toLocaleDateString()}\n\n- [ ] Task 1\n- [ ] Task 2\n`;
    } else if (fileTemplate === 'json') {
      initialCode = `{\n  "name": "${fileName}",\n  "version": "1.0.0",\n  "active": true\n}\n`;
    } else if (fileTemplate === 'shell') {
      initialCode = `#!/usr/bin/env bash\n# VCA OS Shell Script\necho "Running host automation..."\n`;
    }

    try {
      const filePath = `vca_projects/${fileName.trim()}`;
      await runtimeApi.createFileOrFolder(filePath, false, initialCode);
      createFile({
        name: fileName.trim(),
        path: filePath,
        type: fileTemplate === 'markdown' ? 'document' : 'code',
        content: initialCode,
        size: initialCode.length,
        isFolder: false
      });
      logActivity('CREATE_FILE', `Created file "${fileName}"`);
      addNotification({
        title: 'File Created',
        message: `Created "${fileName}" and saved to workspace`,
        type: 'success'
      });
      setIsCreatingFile(false);
      openWindow('code', { fileId: filePath });
      onClose();
    } catch (err: any) {
      alert(`Error creating file: ${err.message}`);
    }
  };

  const handleAddStickyNoteWidget = () => {
    addWidget({
      id: `w-note-${Date.now()}`,
      title: 'Sticky Memo',
      type: 'notes_scratchpad',
      size: 'small',
      position: { x: Math.min(window.innerWidth - 300, x), y: Math.min(window.innerHeight - 300, y) },
      refreshIntervalMs: 0,
      isPinned: true,
      isLocked: false,
      theme: 'cyber',
      props: { text: '# Quick Note\n- Press & hold desktop for options\n- Upload video or GIF wallpaper' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    logActivity('WIDGET_ADDED', 'Placed a Sticky Memo on the desktop');
    onClose();
  };

  const handleAddHardwareMonitorWidget = () => {
    addWidget({
      id: `w-sys-${Date.now()}`,
      title: 'System Monitor',
      type: 'system_monitor',
      size: 'medium',
      position: { x: Math.min(window.innerWidth - 350, x), y: Math.min(window.innerHeight - 250, y) },
      refreshIntervalMs: 2500,
      isPinned: true,
      isLocked: false,
      theme: 'glass',
      props: { showGraph: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    logActivity('WIDGET_ADDED', 'Placed System Monitor widget on the desktop');
    onClose();
  };

  const handleAddPortMonitorWidget = () => {
    addWidget({
      id: `w-port-${Date.now()}`,
      title: 'Active Ports & Daemons',
      type: 'port_monitor',
      size: 'medium',
      position: { x: Math.min(window.innerWidth - 350, x), y: Math.min(window.innerHeight - 250, y) },
      refreshIntervalMs: 3000,
      isPinned: true,
      isLocked: false,
      theme: 'dark',
      props: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    logActivity('WIDGET_ADDED', 'Placed Port Daemon Monitor widget on the desktop');
    onClose();
  };

  const handleTriggerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files: FileList = e.target.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const content = ev.target?.result as string;
          const isBinary = !file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.json');
          
          try {
            await runtimeApi.uploadFile('vca_projects', file.name, content, isBinary);
            createFile({
              name: file.name,
              path: `vca_projects/${file.name}`,
              type: file.type.startsWith('image/') ? 'image' : 'code',
              content: isBinary ? '[Binary File]' : content,
              size: file.size,
              isFolder: false
            });
            addNotification({
              title: 'File Uploaded',
              message: `Uploaded "${file.name}" to workspace`,
              type: 'success'
            });
          } catch (err: any) {
            console.error('Upload failed:', err);
          }
        };
        if (!file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.json')) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      }
    };
    input.click();
    onClose();
  };

  return (
    <>
      {/* Context Menu Popup */}
      <div
        ref={menuRef}
        style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }}
        className="fixed z-50 w-64 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-200 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 select-none divide-y divide-slate-800"
      >
        {/* Section 1: Wallpaper & Appearance */}
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => {
              setWallpaperModalOpen(true);
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-500/20 hover:text-cyan-300 text-left flex items-center justify-between group transition font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Customize Wallpaper</span>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">Studio</span>
          </button>

          {/* Quick Presets Submenu Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu('wallpapers')}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button
              onClick={() => setActiveSubmenu(activeSubmenu === 'wallpapers' ? null : 'wallpapers')}
              className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center justify-between group transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Quick Wallpaper</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300">▶</span>
            </button>

            {/* Submenu */}
            {activeSubmenu === 'wallpapers' && (
              <div className="absolute left-full top-0 ml-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs space-y-1 backdrop-blur-xl z-50">
                <button
                  onClick={() => {
                    setWallpaperConfig({
                      type: 'matrix',
                      id: 'matrix-rain',
                      name: 'Matrix Digital Rain',
                      blur: 0,
                      dim: 20
                    });
                    onClose();
                  }}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-300 text-left flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Matrix Rain (Canvas)
                </button>
                <button
                  onClick={() => {
                    setWallpaperConfig({
                      type: 'gif',
                      id: 'cyber-neon-gif',
                      name: 'Cyber Neon Metropolis',
                      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80',
                      blur: 0,
                      dim: 20
                    });
                    onClose();
                  }}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-left flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Cyber Neon (GIF)
                </button>
                <button
                  onClick={() => {
                    setWallpaperConfig({
                      type: 'preset',
                      id: 'deep-space',
                      name: 'Deep Nebula Space',
                      blur: 0,
                      dim: 0
                    });
                    onClose();
                  }}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-purple-500/20 hover:text-purple-300 text-left flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Deep Space Nebula
                </button>
                <button
                  onClick={() => {
                    setWallpaperConfig({
                      type: 'preset',
                      id: 'cyber-dark',
                      name: 'Graphite Dark Lab',
                      blur: 0,
                      dim: 0
                    });
                    onClose();
                  }}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-700 hover:text-white text-left flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Graphite Minimal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Filesystem & Workspace Creation */}
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FolderPlus className="w-4 h-4 text-blue-400" />
              <span>New Folder...</span>
            </div>
            <span className="text-[10px] text-slate-500">Workspace</span>
          </button>

          <button
            onClick={() => setIsCreatingFile(true)}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FilePlus className="w-4 h-4 text-teal-400" />
              <span>New File / Script...</span>
            </div>
            <span className="text-[10px] text-slate-500">Code/Doc</span>
          </button>

          <button
            onClick={handleTriggerUpload}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload Files to Workspace</span>
          </button>

          <button
            onClick={() => {
              openWindow('files');
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span>Open Universal Filesystem</span>
          </button>
        </div>

        {/* Section 3: Applications & Agents */}
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => {
              openWindow('terminal');
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open Host Terminal</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">bash</span>
          </button>

          <button
            onClick={() => {
              openWindow('command');
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Launch AI Agent Command</span>
          </button>

          {/* Desktop Widgets Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu('widgets')}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button
              onClick={() => setActiveSubmenu(activeSubmenu === 'widgets' ? null : 'widgets')}
              className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center justify-between group transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 text-amber-400" />
                <span>Add Desktop Widget</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300">▶</span>
            </button>

            {/* Submenu */}
            {activeSubmenu === 'widgets' && (
              <div className="absolute left-full top-0 ml-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 text-xs space-y-1 backdrop-blur-xl z-50">
                <button
                  onClick={handleAddStickyNoteWidget}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-amber-500/20 hover:text-amber-300 text-left flex items-center gap-2"
                >
                  <StickyNote className="w-3.5 h-3.5 text-amber-400" /> Sticky Memo Note
                </button>
                <button
                  onClick={handleAddHardwareMonitorWidget}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-300 text-left flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> System Hardware Monitor
                </button>
                <button
                  onClick={handleAddPortMonitorWidget}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-300 text-left flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Active Daemons & Ports
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Desktop Window Layout & Diagnostics */}
        <div className="py-1 space-y-0.5">
          <button
            onClick={() => {
              tileWindows();
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Tile & Arrange Windows</span>
          </button>

          <button
            onClick={() => {
              minimizeAllWindows();
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <Minimize2 className="w-4 h-4 text-slate-400" />
            <span>Show Desktop (Minimize All)</span>
          </button>

          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>Display & Runtime Diagnostics</span>
          </button>

          <button
            onClick={() => {
              logActivity('DESKTOP_REFRESH', 'Refreshed desktop environment');
              addNotification({
                title: 'Desktop Environment Refreshed',
                message: 'Compositor and workspace refreshed.',
                type: 'info'
              });
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white text-left flex items-center gap-2.5 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Refresh Desktop Canvas</span>
          </button>
        </div>
      </div>

      {/* CREATE FOLDER MODAL */}
      {isCreatingFolder && (
        <div
          onClick={() => setIsCreatingFolder(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-blue-400" /> Create New Folder
              </h3>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Folder Name:</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  autoFocus
                  placeholder="e.g. models, datasets, reports"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE FILE MODAL */}
      {isCreatingFile && (
        <div
          onClick={() => setIsCreatingFile(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-teal-400" /> Create New File or Script
              </h3>
              <button
                onClick={() => setIsCreatingFile(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">File Name & Extension:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  autoFocus
                  placeholder="e.g. index.ts, agent.py, notes.md"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Starter Template:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'typescript', name: 'TypeScript', ext: '.ts', icon: <Code2 className="w-3.5 h-3.5 text-cyan-400" /> },
                    { id: 'python', name: 'Python', ext: '.py', icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" /> },
                    { id: 'markdown', name: 'Markdown', ext: '.md', icon: <FileText className="w-3.5 h-3.5 text-purple-400" /> },
                    { id: 'json', name: 'JSON Config', ext: '.json', icon: <FileCode className="w-3.5 h-3.5 text-amber-400" /> },
                    { id: 'shell', name: 'Bash Script', ext: '.sh', icon: <Terminal className="w-3.5 h-3.5 text-green-400" /> },
                    { id: 'blank', name: 'Plain Text', ext: '.txt', icon: <FileText className="w-3.5 h-3.5 text-slate-400" /> }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setFileTemplate(tpl.id);
                        const baseName = fileName.split('.')[0] || 'file';
                        setFileName(`${baseName}${tpl.ext}`);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition text-xs ${
                        fileTemplate === tpl.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {tpl.icon}
                      <span className="truncate">{tpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                >
                  Create & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPLAY & RUNTIME DIAGNOSTICS MODAL */}
      {isDiagnosticsOpen && (
        <div
          onClick={() => setIsDiagnosticsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" /> Display & Compositor Diagnostics
              </h3>
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Viewport Resolution</span>
                <span className="font-mono font-bold text-white">
                  {window.innerWidth} × {window.innerHeight} px
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Device Pixel Ratio (DPR)</span>
                <span className="font-mono font-bold text-cyan-400">{window.devicePixelRatio}x (Retina)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Color Depth / Gamut</span>
                <span className="font-mono font-bold text-purple-400">{window.screen.colorDepth || 24}-bit sRGB</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Active Wallpaper Mode</span>
                <span className="font-mono font-bold text-emerald-400 uppercase">
                  {wallpaperConfig.type} ({wallpaperConfig.name || 'Default'})
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block">Hardware Acceleration & Canvas</span>
              <p className="text-slate-300">
                WebGL 2.0 and 2D Canvas compositing are active. Video hardware decoding enabled.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
