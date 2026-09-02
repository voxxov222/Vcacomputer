import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  FileText,
  Save,
  Sparkles,
  Download,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  CheckCircle,
  Copy
} from 'lucide-react';

interface DocsAppProps {
  fileId?: string;
}

export const DocsApp: React.FC<DocsAppProps> = ({ fileId: initialFileId }) => {
  const { files, updateFile, logActivity, addNotification } = useOS();
  const docFiles = files.filter((f) => !f.isFolder && (f.type === 'document' || f.name.endsWith('.md') || f.name.endsWith('.txt')));

  const [activeFileId, setActiveFileId] = useState<string>(initialFileId || (docFiles[0]?.id || ''));
  const [content, setContent] = useState<string>('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId) || docFiles[0];

  useEffect(() => {
    if (activeFile) {
      setContent(activeFile.content);
    }
  }, [activeFileId, activeFile]);

  const handleSave = () => {
    if (activeFile) {
      updateFile(activeFile.id, { content, size: content.length });
      logActivity('DOCUMENT_SAVED', `Updated document ${activeFile.name}`);
      addNotification({
        title: 'Document Saved',
        message: `${activeFile.name} successfully saved to virtual drive.`,
        type: 'success'
      });
    }
  };

  const handleAiExpand = async () => {
    setIsAiDrafting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const expanded = `${content}\n\n### AI Forensic Addendum (Generated ${new Date().toLocaleDateString()})\n- Standard card dimension verified within tolerance (63.5mm x 88.9mm).\n- Micro-print alignment under 30x optical resolution indicates authentic multi-pass offset lithography.\n- Tamper-evident NFC binding confirmed with collision-resistant UID.\n`;
      setContent(expanded);
      addNotification({
        title: 'AI Draft Completed',
        message: 'Forensic documentation section appended.',
        type: 'info'
      });
    } finally {
      setIsAiDrafting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Document Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">{activeFile?.name || 'Document Editor'}</span>
        </div>

        {/* Formatting buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setContent((c) => `# ${c}`)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setContent((c) => `## ${c}`)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setContent((c) => `**${c}**`)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setContent((c) => `*${c}*`)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAiExpand}
            disabled={isAiDrafting}
            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg font-medium flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3" /> AI Draft
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
          >
            <Save className="w-3 h-3" /> Save
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex justify-center">
        <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-2xl min-h-[500px] flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 bg-transparent text-slate-100 text-sm leading-relaxed focus:outline-none resize-none font-sans"
            placeholder="Type or paste document content..."
          />
        </div>
      </div>
    </div>
  );
};
