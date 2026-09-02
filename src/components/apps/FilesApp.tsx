import React, { useState, useEffect, useRef } from 'react';
import { runtimeApi } from '../../lib/runtimeApi';
import { RealFileItem } from '../../types/runtime';
import { useOS } from '../../context/OSContext';
import {
  Folder,
  FileText,
  Code2,
  FileSpreadsheet,
  Image as ImageIcon,
  Plus,
  Trash2,
  Search,
  ChevronRight,
  Eye,
  Archive,
  RefreshCw,
  Save,
  ShieldCheck,
  FolderPlus,
  FilePlus,
  ArrowUp,
  Upload,
  Palette,
  Film,
  Download,
  Check,
  X
} from 'lucide-react';

interface FilesAppProps {
  initialPath?: string;
  initialFolder?: string;
}

export const FilesApp: React.FC<FilesAppProps> = ({ initialPath, initialFolder }) => {
  const { logActivity, setWallpaperConfig, addNotification } = useOS();
  const [currentPath, setCurrentPath] = useState(initialFolder || initialPath || '.');
  const [parentPath, setParentPath] = useState<string>('.');
  const [files, setFiles] = useState<RealFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<RealFileItem | null>(null);
  const [showHidden, setShowHidden] = useState(true);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // File Viewer / Editor State
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Creation State
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [fileTemplate, setFileTemplate] = useState('typescript');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchFiles = async (dirPath: string) => {
    setIsLoading(true);
    try {
      const res = await runtimeApi.listFiles(dirPath, showHidden);
      setFiles(res.items);
      setCurrentPath(res.path);
      setParentPath(res.parent);
    } catch (err: any) {
      console.error('Failed to list files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [showHidden]);

  const isMediaFile = (file: RealFileItem) => {
    const ext = file.extension.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'mp4', 'webm', 'mov', 'ogg'].includes(ext);
  };

  const isVideoFile = (file: RealFileItem) => {
    const ext = file.extension.toLowerCase();
    return ['mp4', 'webm', 'mov', 'ogg'].includes(ext);
  };

  const isGifFile = (file: RealFileItem) => {
    return file.extension.toLowerCase() === 'gif';
  };

  const handleOpenItem = async (item: RealFileItem) => {
    if (item.isDirectory) {
      fetchFiles(item.path);
      setSelectedFile(null);
      setFileContent(null);
      setMediaUrl(null);
    } else {
      setSelectedFile(item);
      if (isMediaFile(item)) {
        // For media files, construct direct local path or read base64 if needed
        setMediaUrl(`/api/files/read?path=${encodeURIComponent(item.path)}`);
        setFileContent(null);
        setIsEditing(false);
      } else {
        setMediaUrl(null);
        try {
          const data = await runtimeApi.readFile(item.path);
          setFileContent(data.content);
          setIsEditing(false);
        } catch (err: any) {
          setFileContent(`[Error reading file: ${err.message}]`);
        }
      }
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || fileContent === null) return;
    setIsSaving(true);
    try {
      await runtimeApi.writeFile(selectedFile.path, fileContent);
      logActivity('FILE_SAVED', `Saved changes to ${selectedFile.name}`);
      addNotification({
        title: 'File Saved',
        message: `Saved changes to ${selectedFile.name}`,
        type: 'success'
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (item: RealFileItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await runtimeApi.deleteFileOrFolder(item.path);
      logActivity('FILE_DELETED', `Deleted ${item.name}`);
      addNotification({
        title: 'Item Deleted',
        message: `Deleted ${item.name}`,
        type: 'info'
      });
      fetchFiles(currentPath);
      if (selectedFile?.path === item.path) {
        setSelectedFile(null);
        setFileContent(null);
        setMediaUrl(null);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSetAsWallpaper = async (item: RealFileItem) => {
    try {
      const isVideo = isVideoFile(item);
      const isGif = isGifFile(item);
      const mediaType: 'image' | 'video' | 'gif' = isVideo ? 'video' : isGif ? 'gif' : 'image';

      // Read file content as base64
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(item.path)}`);
      let sourceUrl = `/api/files/read?path=${encodeURIComponent(item.path)}`;

      setWallpaperConfig({
        type: mediaType,
        id: `file-wp-${Date.now()}`,
        name: item.name,
        url: sourceUrl,
        blur: 0,
        dim: 15,
        fit: 'cover'
      });

      logActivity('WALLPAPER_CHANGED', `Set wallpaper from file: ${item.name}`);
      addNotification({
        title: 'Wallpaper Updated',
        message: `Desktop wallpaper set to "${item.name}" (${mediaType.toUpperCase()})`,
        type: 'success'
      });
    } catch (err: any) {
      alert(`Failed to set wallpaper: ${err.message}`);
    }
  };

  const handleExtractArchive = async (item: RealFileItem) => {
    try {
      await runtimeApi.extractArchive(item.path, currentPath);
      addNotification({
        title: 'Archive Extracted',
        message: `Extracted ${item.name} successfully`,
        type: 'success'
      });
      fetchFiles(currentPath);
    } catch (err: any) {
      alert(`Extraction error: ${err.message}`);
    }
  };

  const handleCreateNewFile = async () => {
    if (!newItemName.trim()) return;
    const itemPath = `${currentPath}/${newItemName.trim()}`;

    let initialCode = '// VCA OS File\n';
    if (fileTemplate === 'typescript') {
      initialCode = `/**\n * ${newItemName}\n */\nexport function handler() {\n  console.log("Executed ${newItemName}");\n}\n`;
    } else if (fileTemplate === 'python') {
      initialCode = `#!/usr/bin/env python3\n"""\n${newItemName}\n"""\n\ndef main():\n    print("Executing ${newItemName}")\n\nif __name__ == "__main__":\n    main()\n`;
    } else if (fileTemplate === 'markdown') {
      initialCode = `# ${newItemName.replace(/\.md$/i, '')}\n\nCreated: ${new Date().toLocaleDateString()}\n\n## Overview\n- Enter project notes here...\n`;
    } else if (fileTemplate === 'json') {
      initialCode = `{\n  "name": "${newItemName}",\n  "version": "1.0.0",\n  "active": true\n}\n`;
    } else if (fileTemplate === 'html') {
      initialCode = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${newItemName}</title>\n</head>\n<body>\n  <h1>${newItemName}</h1>\n</body>\n</html>\n`;
    } else if (fileTemplate === 'shell') {
      initialCode = `#!/usr/bin/env bash\n# VCA Shell Script\necho "Running script..."\n`;
    }

    try {
      await runtimeApi.createFileOrFolder(itemPath, false, initialCode);
      setNewItemName('');
      setIsCreatingFile(false);
      logActivity('FILE_CREATED', `Created file ${newItemName}`);
      addNotification({
        title: 'File Created',
        message: `Created file "${newItemName}"`,
        type: 'success'
      });
      fetchFiles(currentPath);
    } catch (err: any) {
      alert(`Creation error: ${err.message}`);
    }
  };

  const handleCreateNewFolder = async () => {
    if (!newItemName.trim()) return;
    const itemPath = `${currentPath}/${newItemName.trim()}`;
    try {
      await runtimeApi.createFileOrFolder(itemPath, true, '');
      setNewItemName('');
      setIsCreatingFolder(false);
      logActivity('FOLDER_CREATED', `Created folder ${newItemName}`);
      addNotification({
        title: 'Folder Created',
        message: `Created folder "${newItemName}"`,
        type: 'success'
      });
      fetchFiles(currentPath);
    } catch (err: any) {
      alert(`Creation error: ${err.message}`);
    }
  };

  const handleFileUpload = async (filesToUpload: FileList | File[]) => {
    if (!filesToUpload || filesToUpload.length === 0) return;

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const reader = new FileReader();

      reader.onload = async (ev) => {
        const content = ev.target?.result as string;
        const isBinary = !file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.json') && !file.name.endsWith('.ts') && !file.name.endsWith('.js');

        try {
          await runtimeApi.uploadFile(currentPath, file.name, content, isBinary);
          logActivity('FILE_UPLOADED', `Uploaded ${file.name} to ${currentPath}`);
          addNotification({
            title: 'File Uploaded',
            message: `Uploaded "${file.name}" successfully`,
            type: 'success'
          });
          fetchFiles(currentPath);
        } catch (err: any) {
          alert(`Failed to upload ${file.name}: ${err.message}`);
        }
      };

      if (!file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md') && !file.name.endsWith('.json') && !file.name.endsWith('.ts') && !file.name.endsWith('.js')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (file: RealFileItem) => {
    if (file.isDirectory) return <Folder className="w-4 h-4 text-blue-400 shrink-0" />;
    const ext = file.extension.toLowerCase();
    if (['zip', 'tar', 'gz', 'tgz'].includes(ext)) return <Archive className="w-4 h-4 text-amber-400 shrink-0" />;
    if (['mp4', 'webm', 'mov', 'ogg'].includes(ext)) return <Film className="w-4 h-4 text-purple-400 shrink-0" />;
    if (['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'rs', 'go', 'html', 'css'].includes(ext))
      return <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />;
    if (['csv', 'xlsx', 'sheet'].includes(ext)) return <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) return <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />;
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs relative ${
        isDraggingOver ? 'ring-2 ring-cyan-400 ring-inset' : ''
      }`}
    >
      {/* Top Header & Toolbar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0 max-w-md">
          <button
            onClick={() => fetchFiles(parentPath)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Go to parent directory"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <Folder className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-bold text-slate-200 truncate">Workspace</span>
          <span className="text-slate-500">/</span>
          <span className="text-cyan-400 font-mono truncate">{currentPath}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative w-32 md:w-44">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`px-2 py-1 rounded-lg text-[10px] border font-mono ${
              showHidden ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {showHidden ? 'Hidden: ON' : 'Hidden: OFF'}
          </button>

          {/* New File Button */}
          <button
            onClick={() => {
              setNewItemName('script.ts');
              setIsCreatingFile(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold"
          >
            <FilePlus className="w-3.5 h-3.5 text-teal-400" /> New File
          </button>

          {/* New Folder Button */}
          <button
            onClick={() => {
              setNewItemName('new_folder');
              setIsCreatingFolder(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 font-semibold"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-400" /> New Folder
          </button>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 font-semibold shadow"
          >
            <Upload className="w-3.5 h-3.5" /> Upload
          </button>

          <button
            onClick={() => fetchFiles(currentPath)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split Layout: File List & Live Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File List */}
        <div className="w-1/2 border-r border-slate-800 overflow-y-auto divide-y divide-slate-900 font-mono">
          {filteredFiles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Folder className="w-8 h-8 mx-auto opacity-30" />
              <p>No items found in this directory.</p>
              <p className="text-[10px] text-slate-600">Drag and drop files here or click Upload.</p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleOpenItem(file)}
                className={`p-2.5 flex items-center justify-between hover:bg-slate-900/80 cursor-pointer transition-colors ${
                  selectedFile?.path === file.path ? 'bg-cyan-950/40' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getFileIcon(file)}
                  <div className="min-w-0">
                    <span className={`block truncate ${file.isDirectory ? 'font-bold text-slate-200' : 'text-slate-300'}`}>
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-sans">
                      {file.isDirectory ? 'Folder' : `${file.sizeBytes} bytes`} • {new Date(file.modifiedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-70 hover:opacity-100">
                  {/* Set as wallpaper if media file */}
                  {isMediaFile(file) && !file.isDirectory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetAsWallpaper(file);
                      }}
                      className="px-1.5 py-0.5 rounded bg-pink-950/60 text-pink-300 border border-pink-800 text-[10px] flex items-center gap-1 font-sans hover:bg-pink-900"
                      title="Set as Desktop Wallpaper"
                    >
                      <Palette className="w-3 h-3 text-pink-400" /> Wallpaper
                    </button>
                  )}

                  {['zip', 'tar', 'gz', 'tgz'].includes(file.extension.toLowerCase()) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtractArchive(file);
                      }}
                      className="p-1 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] flex items-center gap-1 font-sans"
                      title="Extract Archive"
                    >
                      <Archive className="w-3 h-3" /> Extract
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(file);
                    }}
                    className="p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Live File Viewer & Editor */}
        <div className="w-1/2 flex flex-col bg-slate-950">
          {selectedFile ? (
            <>
              <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between">
                <span className="font-mono text-cyan-300 truncate font-semibold">{selectedFile.name}</span>
                <div className="flex items-center gap-2">
                  {isMediaFile(selectedFile) && (
                    <button
                      onClick={() => handleSetAsWallpaper(selectedFile)}
                      className="px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white font-medium text-[11px] flex items-center gap-1 font-sans shadow"
                    >
                      <Palette className="w-3 h-3" /> Set Wallpaper
                    </button>
                  )}

                  {fileContent !== null && (
                    <button
                      onClick={handleSaveFile}
                      disabled={isSaving}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 font-sans shadow"
                    >
                      <Save className="w-3 h-3" /> Save Changes
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-2 overflow-hidden flex flex-col">
                {isMediaFile(selectedFile) ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-950 space-y-4">
                    <div className="max-w-full max-h-80 rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-lg">
                      {isVideoFile(selectedFile) ? (
                        <video
                          src={mediaUrl || ''}
                          controls
                          autoPlay
                          loop
                          className="max-h-72 w-auto"
                        />
                      ) : (
                        <img
                          src={mediaUrl || ''}
                          alt={selectedFile.name}
                          className="max-h-72 object-contain"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-slate-300 font-bold block">{selectedFile.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {selectedFile.sizeBytes} bytes • {selectedFile.extension.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={fileContent || ''}
                    onChange={(e) => {
                      setFileContent(e.target.value);
                      setIsEditing(true);
                    }}
                    className="flex-1 w-full bg-slate-950 text-slate-200 font-mono text-xs p-2.5 focus:outline-none resize-none leading-relaxed select-text"
                    spellCheck={false}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
              <FileText className="w-8 h-8 opacity-40" />
              <span>Select any file to preview, edit, or set as wallpaper</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE FILE */}
      {isCreatingFile && (
        <div
          onClick={() => setIsCreatingFile(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-teal-400" /> Create New File
              </h3>
              <button
                onClick={() => setIsCreatingFile(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">File Name:</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. index.ts, app.py, readme.md"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Template:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'typescript', name: 'TypeScript', ext: '.ts' },
                    { id: 'python', name: 'Python', ext: '.py' },
                    { id: 'markdown', name: 'Markdown', ext: '.md' },
                    { id: 'json', name: 'JSON', ext: '.json' },
                    { id: 'html', name: 'HTML5', ext: '.html' },
                    { id: 'shell', name: 'Bash', ext: '.sh' }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setFileTemplate(tpl.id);
                        const baseName = newItemName.split('.')[0] || 'file';
                        setNewItemName(`${baseName}${tpl.ext}`);
                      }}
                      className={`p-2 rounded-xl border text-center text-xs transition ${
                        fileTemplate === tpl.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreatingFile(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE FOLDER */}
      {isCreatingFolder && (
        <div
          onClick={() => setIsCreatingFolder(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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

            <div>
              <label className="block text-xs text-slate-400 mb-1">Folder Name:</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. assets, models, archives"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewFolder()}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFolder}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag overlay indicator */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-300 z-50 pointer-events-none">
          <Upload className="w-12 h-12 animate-bounce mb-2 text-cyan-400" />
          <span className="font-bold text-sm">Drop files here to upload to {currentPath}</span>
        </div>
      )}
    </div>
  );
};
