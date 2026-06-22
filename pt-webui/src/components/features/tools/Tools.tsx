import React from 'react';
import { FileText, Database } from 'lucide-react';

export function Tools() {
  return (
    <div className="space-y-6 font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">SYS_DIAGNOSTICS.EXE</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">UTILITIES FOR SCRIPT GENERATION AND DATA MOCKING.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'POSTMAN_TO_K6', desc: 'CONVERT POSTMAN COLLECTIONS TO K6 SCRIPTS', icon: FileText },
          { title: 'PAYLOAD_GENERATOR', desc: 'GENERATE MOCK JSON PAYLOADS FOR TESTING', icon: Database },
        ].map((t, i) => (
          <div key={i} className="p-6 bg-black border-2 border-[#333] hover:border-emerald-500 transition-colors cursor-pointer group flex flex-col justify-between h-40">
            <t.icon className="w-8 h-8 text-[#555] group-hover:text-emerald-500 mb-4 transition-colors" />
            <div>
              <h3 className="text-sm font-bold text-emerald-500 mb-1 tracking-widest uppercase">[{t.title}]</h3>
              <p className="text-xs text-[#888]">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
