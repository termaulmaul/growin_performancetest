import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, Play, X, Terminal, LifeBuoy, FileText } from 'lucide-react';

export function Tools() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState("");

  const runTool = async (tool: string) => {
    setActiveTool(tool);
    setLoading(true);
    setOutput("");
    
    let method = "GET";
    let body = undefined;
    
    if (tool === "rescue") {
      const username = prompt("Enter username to rescue:");
      if (!username) { setLoading(false); return; }
      const password = prompt("Enter new password:");
      if (!password) { setLoading(false); return; }
      method = "POST";
      body = JSON.stringify({ username, password });
    }

    try {
      const res = await fetch(`/api/tools/${tool}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body
      });
      const data = await res.json();
      setOutput(data.output || "No output");
    } catch(e) {
      setOutput("Error connecting to server");
    }
    setLoading(false);
  };

  const tools = [
    { id: 'resmon', title: 'PT-RESMON', desc: 'SYSTEM RESOURCE MONITOR', icon: Activity },
    { id: 'bootstrap-check', title: 'PT-BOOTSTRAP-CHECK', desc: 'SYSTEM PREREQUISITES CHECK', icon: ShieldCheck },
    { id: 'lock-status', title: 'PT-LOCK-STATUS', desc: 'ENVIRONMENT LOCK STATUS', icon: Lock },
    { id: 'rescue', title: 'PT-RESCUE', desc: 'EMERGENCY ACCOUNT RECOVERY', icon: LifeBuoy },
    { id: 'audit-tail', title: 'PT-AUDIT TAIL', desc: 'LATEST AUDIT LOG ENTRIES', icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">SYS_DIAGNOSTICS.EXE</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">SYSTEM AND ENVIRONMENT DIAGNOSTIC UTILITIES.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((t) => (
          <div key={t.id} onClick={() => runTool(t.id)} className="p-4 bg-black border-2 border-[#333] hover:border-emerald-500 transition-colors cursor-pointer group flex items-start gap-4 h-24">
            <t.icon className="w-8 h-8 text-[#555] group-hover:text-emerald-500 transition-colors shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-500 mb-1 tracking-widest uppercase">[{t.title}]</h3>
              <p className="text-xs text-[#888]">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTool && (
        <div className="border-2 border-[#333] bg-black h-fit mt-6">
          <div className="p-2 border-b-2 border-[#333] bg-[#0a0a0a] flex justify-between items-center">
            <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2 tracking-widest uppercase">
              <Terminal className="w-4 h-4" /> [{activeTool.toUpperCase()}_OUTPUT]
            </h3>
            <button onClick={() => { setActiveTool(""); setOutput(""); }} className="text-[#888] hover:text-red-500 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-[#050505] min-h-[200px] overflow-auto max-h-[500px]">
            {loading ? (
              <div className="text-[#888] animate-pulse">Executing {activeTool}...</div>
            ) : (
              <pre className="text-xs text-[#aaa] whitespace-pre-wrap">{output}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
