import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Table,
  Plus,
  Save,
  Sparkles,
  TrendingUp,
  Download,
  DollarSign
} from 'lucide-react';

export const SheetsApp: React.FC = () => {
  const { vcaCards, logActivity, addNotification } = useOS();

  const [rows, setRows] = useState([
    { id: '1', card: 'Charizard (Shadowless Holo)', set: 'Base Set', rawVal: 220, gradeVal: 1450, vcaGrade: 9.0, pop: 48 },
    { id: '2', card: 'Blastoise (1st Edition)', set: 'Base Set', rawVal: 180, gradeVal: 950, vcaGrade: 8.5, pop: 112 },
    { id: '3', card: 'Venusaur (Shadowless)', set: 'Base Set', rawVal: 140, gradeVal: 720, vcaGrade: 9.0, pop: 86 },
    { id: '4', card: 'Lugia (Neo Genesis 1st Ed)', set: 'Neo Genesis', rawVal: 350, gradeVal: 2400, vcaGrade: 9.5, pop: 29 },
    { id: '5', card: 'Pikachu Illustrator', set: 'CoroCoro Promo', rawVal: 45000, gradeVal: 120000, vcaGrade: 9.0, pop: 4 }
  ]);

  const handleRecalculate = () => {
    logActivity('SHEETS_RECALCULATED', 'Recalculated portfolio totals across market index');
    addNotification({
      title: 'Spreadsheet Recalculated',
      message: 'Updated live valuation models and profit margins.',
      type: 'success'
    });
  };

  const totalRaw = rows.reduce((acc, r) => acc + r.rawVal, 0);
  const totalGraded = rows.reduce((acc, r) => acc + r.gradeVal, 0);
  const totalValueAdded = totalGraded - totalRaw;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">VCA Price Index & Valuation Model.xlsx</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculate}
            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg font-medium flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3" /> Sync Live Index
          </button>
          <button
            onClick={() => {
              setRows([
                ...rows,
                { id: `${Date.now()}`, card: 'New Intake Card', set: 'Expansion', rawVal: 100, gradeVal: 400, vcaGrade: 9.0, pop: 1 }
              ]);
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" /> Add Row
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="p-3">#</th>
                <th className="p-3">Card Name / Variant</th>
                <th className="p-3">Set / Expansion</th>
                <th className="p-3">Raw Value ($)</th>
                <th className="p-3">VCA Certified Grade</th>
                <th className="p-3">Graded Value ($)</th>
                <th className="p-3">VCA Pop</th>
                <th className="p-3">Value Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                  <td className="p-3 text-slate-500">{i + 1}</td>
                  <td className="p-3 font-semibold text-white font-sans">{r.card}</td>
                  <td className="p-3 text-slate-400 font-sans">{r.set}</td>
                  <td className="p-3 text-slate-300">${r.rawVal.toLocaleString()}</td>
                  <td className="p-3 text-amber-400 font-bold">VCA {r.vcaGrade}</td>
                  <td className="p-3 text-emerald-400 font-bold">${r.gradeVal.toLocaleString()}</td>
                  <td className="p-3 text-cyan-400">{r.pop}</td>
                  <td className="p-3 text-slate-300">{(r.gradeVal / r.rawVal).toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950/80 font-bold border-t-2 border-slate-700 text-white">
                <td className="p-3" colSpan={3}>TOTAL PORTFOLIO VALUATION:</td>
                <td className="p-3 text-slate-300">${totalRaw.toLocaleString()}</td>
                <td className="p-3">-</td>
                <td className="p-3 text-emerald-400 text-sm">${totalGraded.toLocaleString()}</td>
                <td className="p-3">-</td>
                <td className="p-3 text-cyan-400">+${totalValueAdded.toLocaleString()} Value Added</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
