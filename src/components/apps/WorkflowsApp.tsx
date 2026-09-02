import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  GitFork,
  Play,
  Plus,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sliders,
  Camera,
  Layers
} from 'lucide-react';

export const WorkflowsApp: React.FC = () => {
  const { logActivity, addNotification } = useOS();

  const [workflows, setWorkflows] = useState([
    {
      id: 'wf-1',
      name: 'Autonomous Submission Pipeline',
      description: 'Intake -> VScan -> Neural Forensics -> Grading Lab -> QC -> NFC Binding -> Public Certificate',
      status: 'Active',
      schedule: 'Trigger on New Submission',
      steps: [
        { name: '1. Intake & Barcode Scan', tool: 'barcode_scanner' },
        { name: '2. High-Res Multi-Angle VScan', tool: 'vscan_optical' },
        { name: '3. Neural Authentication & Forensic Matrix', tool: 'forensic_auth' },
        { name: '4. AI Grading Recommendation', tool: 'grading_engine' },
        { name: '5. Human Grader Review Gate', tool: 'approval_gate' },
        { name: '6. Cryptographic NFC Binding & Slab Seal', tool: 'nfc_writer' },
        { name: '7. Publish Public QR Certificate & Sync Portfolio', tool: 'cert_publisher' }
      ]
    },
    {
      id: 'wf-2',
      name: 'Nightly Market Pricing Sync',
      description: 'Fetch verified eBay/PWCC/Heritage sales and update VCA Valuation indexes',
      status: 'Scheduled',
      schedule: 'Every night at 00:00 UTC',
      steps: [
        { name: '1. Scrape verified market transactions', tool: 'market_crawler' },
        { name: '2. Calculate moving average & outlier filter', tool: 'pricing_model' },
        { name: '3. Update customer portfolio values', tool: 'portfolio_sync' }
      ]
    }
  ]);

  const [activeWfId, setActiveWfId] = useState('wf-1');
  const activeWf = workflows.find((w) => w.id === activeWfId) || workflows[0];

  const handleRunWorkflow = () => {
    logActivity('WORKFLOW_EXECUTED', `Executed workflow: ${activeWf.name}`);
    addNotification({
      title: 'Workflow Triggered',
      message: `Running "${activeWf.name}" with 7 automated stages.`,
      type: 'info'
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-slate-200">VCA Visual Workflow Engine</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunWorkflow}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
          >
            <Play className="w-3 h-3" /> Run Workflow Now
          </button>
        </div>
      </div>

      {/* Main Visual Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Workflow List */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 p-3 space-y-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Workflows ({workflows.length})
          </span>
          {workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => setActiveWfId(wf.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition ${
                wf.id === activeWf.id
                  ? 'bg-slate-900 border-cyan-500/60 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-400'
              }`}
            >
              <div className="font-bold text-xs text-slate-100">{wf.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono mt-1">{wf.schedule}</div>
            </button>
          ))}
        </div>

        {/* Visual Pipeline Canvas */}
        <div className="flex-1 bg-slate-900/40 p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">{activeWf.name}</h3>
            <p className="text-xs text-slate-400">{activeWf.description}</p>
          </div>

          <div className="space-y-3 max-w-2xl">
            {activeWf.steps.map((step, idx) => (
              <div key={idx} className="relative flex items-center gap-4">
                <div className="flex-1 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md hover:border-cyan-500/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold font-mono flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">{step.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">tool: {step.tool}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    READY
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
