import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Mail, Send, Sparkles, User, Clock, CheckCircle } from 'lucide-react';

export const MailApp: React.FC = () => {
  const { customers, logActivity, addNotification } = useOS();
  const [recipientEmail, setRecipientEmail] = useState(customers[0]?.email || 'collector@vca-authority.com');
  const [subject, setSubject] = useState('VCA Certification Notice: Submission #VCA-2026-00128 Completed');
  const [message, setMessage] = useState(
    `Dear Collector,\n\nWe are pleased to inform you that your Pokémon collectible cards have completed all stages of the VCA forensic authentication and grading workflow.\n\nSummary:\n- Charizard (Shadowless Holo) #4 -> VCA GEM MINT 9.0 (Cert: #VCA-2026-9901)\n- Tamper-Evident NFC Identity securely bound to slab.\n\nYou may view your live digital certificate and track your verified portfolio at https://vca-authority.com/verify/VCA-2026-9901.\n\nThank you for trusting Verified Card Authority.\n\nBest regards,\nVCA Autonomous Operations`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      logActivity('MAIL_SENT', `Sent certification notification to ${recipientEmail}`);
      addNotification({
        title: 'Customer Email Dispatched',
        message: `Notification delivered to ${recipientEmail}.`,
        type: 'success'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Customer Communication & Dispatch</span>
        </div>

        <button
          onClick={handleSend}
          disabled={isSending}
          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20"
        >
          <Send className="w-3 h-3" /> {isSending ? 'Dispatching...' : 'Send Message'}
        </button>
      </div>

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-16">To:</span>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-16">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 text-xs text-white font-semibold"
            />
          </div>
          <div className="pt-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none resize-none font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
