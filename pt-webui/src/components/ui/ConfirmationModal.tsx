import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { RunConfig } from '../../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  config: RunConfig;
  target: string;
  script: string;
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, config, target, script }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-[in_0.2s_ease-out]">
        <div className="p-6 border-b border-white/5 flex items-start gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-full">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Confirm Execution</h3>
            <p className="text-sm text-slate-400">You are about to run a load test on <strong className="text-white">{config.env}</strong> environment. This action will generate traffic.</p>
          </div>
        </div>
        <div className="p-4 bg-[#0a0f1c] space-y-2 text-sm font-mono text-slate-300">
           <div className="flex justify-between border-b border-white/5 pb-2"><span>Target:</span> <span className="text-cyan-400">{target}</span></div>
           <div className="flex justify-between border-b border-white/5 pb-2"><span>Script:</span> <span className="text-cyan-400">{script}</span></div>
           <div className="flex justify-between border-b border-white/5 pb-2"><span>VUs:</span> <span className="text-cyan-400">{config.vus}</span></div>
           <div className="flex justify-between"><span>Duration:</span> <span className="text-cyan-400">{config.duration}</span></div>
        </div>
        <div className="p-4 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all active:scale-95"
          >
            Confirm & Run
          </button>
        </div>
      </div>
    </div>
  );
}
