import React, { useState, useEffect } from 'react';

export function History() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditText, setAuditText] = useState<string>('');
  const [recentRuns, setRecentRuns] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/audit-trail', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAuditLogs(data);
        }
      })
      .catch(console.error);

    fetch('/api/recent-runs', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentRuns(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full font-mono">
      <section>
        <header className="border-b-2 border-[#333] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">RECENT_RUNS.JSON</h2>
          <p className="text-[#888] text-xs tracking-widest uppercase">LATEST K6 EXECUTIONS.</p>
        </header>
        <div className="border-2 border-[#333] bg-black overflow-x-auto">
          <table className="w-full text-left text-xs text-[#aaa] whitespace-nowrap">
            <thead className="bg-[#111] text-[#888] border-b-2 border-[#333]">
              <tr>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[TIMESTAMP]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[SCRIPT]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[ENV]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[VUS/DUR]</th>
                <th className="p-3 font-bold tracking-widest uppercase">[PLATFORM]</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.length === 0 ? (
                <tr><td colSpan={5} className="p-3 text-center text-[#555]">No recent runs found.</td></tr>
              ) : recentRuns.map((r, i) => (
                <tr key={i} className="border-b border-[#333] hover:bg-[#111] transition-colors">
                  <td className="p-3 border-r-2 border-[#333] font-mono text-cyan-500">{r.date}</td>
                  <td className="p-3 border-r-2 border-[#333] font-bold text-amber-500">{r.script}</td>
                  <td className="p-3 border-r-2 border-[#333]">{r.env}</td>
                  <td className="p-3 border-r-2 border-[#333]">{r.vus} / {r.duration}</td>
                  <td className="p-3">{r.platform} {r.scenario ? `(${r.scenario})` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <header className="border-b-2 border-[#333] pb-4 mb-4">
          <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">AUDIT_TRAIL.LOG</h2>
          <p className="text-[#888] text-xs tracking-widest uppercase">SYSTEM AUDIT EVENTS.</p>
        </header>
        <div className="border-2 border-[#333] bg-black overflow-x-auto">
          <table className="w-full text-left text-xs text-[#aaa] whitespace-nowrap">
            <thead className="bg-[#111] text-[#888] border-b-2 border-[#333]">
              <tr>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[TIMESTAMP]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[USER]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[ACTION]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[RESOURCE]</th>
                <th className="p-3 font-bold tracking-widest uppercase">[DETAIL]</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr><td colSpan={5} className="p-3 text-center text-[#555]">Loading or no audit entries...</td></tr>
              ) : auditLogs.map((log, i) => (
                <tr key={i} className="border-b border-[#333] hover:bg-[#111] transition-colors">
                  <td className="p-3 border-r-2 border-[#333] font-mono text-cyan-500">{log.timestamp}</td>
                  <td className="p-3 border-r-2 border-[#333] font-bold text-emerald-400">{log.user}</td>
                  <td className="p-3 border-r-2 border-[#333] font-bold text-amber-500">{log.action}</td>
                  <td className="p-3 border-r-2 border-[#333]">{log.resource}</td>
                  <td className="p-3">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
