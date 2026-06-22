import React from 'react';
import { Server, Cloud, Box, Check } from 'lucide-react';

interface TargetSelectorProps {
  target: string;
  setTarget: (t: string) => void;
}

export function TargetSelector({ target, setTarget }: TargetSelectorProps) {
  const targets = [
    { id: 'Onprem', icon: Server, desc: 'Local baremetal' },
    { id: 'Oncloud', icon: Cloud, desc: 'Distributed AWS/GCP' },
    { id: 'Sandbox', icon: Box, desc: 'Isolated test env' }
  ];

  return (
    <section className="space-y-3 font-mono">
      <label className="text-xs font-bold text-emerald-500 tracking-widest">[TARGET_NODE]</label>
      <div className="flex gap-4">
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => setTarget(t.id)}
            className={`flex-1 flex flex-col items-start p-3 border-2 transition-all duration-150 group ${
              target === t.id 
                ? 'bg-[#111] border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'bg-black border-[#333] text-[#666] hover:border-[#555] hover:text-amber-500'
            }`}
          >
            <div className="flex justify-between w-full mb-1">
              <t.icon className={`w-5 h-5`} />
              {target === t.id && <Check className="w-4 h-4" />}
            </div>
            <span className="font-bold uppercase tracking-wider text-sm">{t.id}</span>
            <span className="text-[10px] uppercase tracking-widest">{t.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
