import React from 'react';

export function History() {
  return (
    <div className="space-y-6 font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">AUDIT_TRAIL.LOG</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">RECENT PERFORMANCE EXECUTION LOGS.</p>
      </header>
      <div className="border-2 border-[#333] bg-black">
        <table className="w-full text-left text-xs text-[#aaa]">
          <thead className="bg-[#111] text-[#888] border-b-2 border-[#333]">
            <tr>
              <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[TIMESTAMP]</th>
              <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[SCRIPT]</th>
              <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[ENV]</th>
              <th className="p-3 font-bold tracking-widest uppercase">[STATUS]</th>
            </tr>
          </thead>
          <tbody>
            {[
              { d: '2026-06-22 10:00:00', s: 'auth_login_flow.js', e: 'PROD', st: 'SUCCESS' },
              { d: '2026-06-21 15:30:12', s: 'checkout_pipeline_stress.js', e: 'STG', st: 'FAILED' },
              { d: '2026-06-20 09:15:45', s: 'api_search_regression.js', e: 'INT', st: 'SUCCESS' },
            ].map((r, i) => (
              <tr key={i} className="border-b border-[#333] hover:bg-[#111] transition-colors">
                <td className="p-3 border-r-2 border-[#333] font-mono text-cyan-500">{r.d}</td>
                <td className="p-3 border-r-2 border-[#333] font-bold text-amber-500">{r.s}</td>
                <td className="p-3 border-r-2 border-[#333]">{r.e}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-[10px] font-bold tracking-widest border ${r.st === 'SUCCESS' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                    {r.st}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
