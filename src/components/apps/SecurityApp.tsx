import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileKey,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface SecretItem {
  id: string;
  name: string;
  category: 'api_key' | 'ssh_key' | 'token' | 'certificate';
  maskedValue: string;
  realValue: string;
  updatedAt: string;
}

export const SecurityApp: React.FC = () => {
  const { addNotification } = useOS();
  const [secrets, setSecrets] = useState<SecretItem[]>([
    {
      id: 'sec-gemini',
      name: 'GEMINI_API_KEY',
      category: 'api_key',
      maskedValue: 'AIzaSy****************************',
      realValue: 'AIzaSyB34k981K_vca_secret_active',
      updatedAt: '2 hours ago'
    },
    {
      id: 'sec-github',
      name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
      category: 'token',
      maskedValue: 'ghp_********************************',
      realValue: 'ghp_vca_os_runtime_pat_92817281',
      updatedAt: 'Yesterday'
    },
    {
      id: 'sec-nfc-key',
      name: 'NFC_AES_CRYPT_MASTER_KEY',
      category: 'certificate',
      maskedValue: '0x9481**************************',
      realValue: '0x94819FBA2019481726CDEFA0192847',
      updatedAt: '3 days ago'
    }
  ]);

  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification({
      title: 'Secret Copied',
      message: 'Sensitive secret was copied to your clipboard safely.',
      type: 'info',
      read: false
    });
  };

  const handleAddSecret = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) return;
    const newItem: SecretItem = {
      id: `sec-${Date.now()}`,
      name: newKeyName.toUpperCase().replace(/\s+/g, '_'),
      category: 'api_key',
      maskedValue: newKeyValue.slice(0, 4) + '****************************',
      realValue: newKeyValue,
      updatedAt: 'Just now'
    };
    setSecrets([newItem, ...secrets]);
    setNewKeyName('');
    setNewKeyValue('');
    setIsAdding(false);
    addNotification({
      title: 'Secret Stored',
      message: `${newItem.name} was encrypted and stored in local vault.`,
      type: 'success',
      read: false
    });
  };

  const handleDelete = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-text">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              VCA OS Security & Encrypted Secrets Vault
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Hardware Enclave Active
              </span>
            </h1>
            <p className="text-xs text-slate-400">AES-256-GCM local storage with kernel permission isolation.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Secret Key</span>
        </button>
      </div>

      {/* Add Secret Form */}
      {isAdding && (
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 space-y-3 animate-in fade-in duration-150 shrink-0">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Store New Secret / Token</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Variable Name (e.g. STRIPE_SECRET_KEY)"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="Secret Value / API Key"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSecret}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
            >
              Encrypt & Save
            </button>
          </div>
        </div>
      )}

      {/* Security Status Cards */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
          <Lock className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs font-bold text-white">Zero-Knowledge Storage</div>
            <div className="text-[10px] text-slate-400">Keys never sent over public network</div>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-white">Agent Permission Gates</div>
            <div className="text-[10px] text-slate-400">Execution approval required for writes</div>
          </div>
        </div>
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-xs font-bold text-white">Process Isolation</div>
            <div className="text-[10px] text-slate-400">Child PIDs run in sandbox cgroups</div>
          </div>
        </div>
      </div>

      {/* Secrets List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Vault Entries ({secrets.length})
        </div>

        {secrets.map((sec) => {
          const isRevealed = !!revealedIds[sec.id];
          return (
            <div
              key={sec.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                  <FileKey className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white font-mono">{sec.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                      {sec.category}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400 mt-1 truncate">
                    {isRevealed ? sec.realValue : sec.maskedValue}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleReveal(sec.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title={isRevealed ? 'Hide Secret' : 'Reveal Secret'}
                >
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleCopy(sec.id, sec.realValue)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
                  title="Copy to Clipboard"
                >
                  {copiedId === sec.id ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(sec.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                  title="Delete Secret"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
