import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Save, Zap } from 'lucide-react';

export function Webhooks() {
  const [hooks, setHooks] = useState<{ id: number; key: string; n: string; u: string; e: string; st: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config', {
      cache: 'no-store',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
        "x-username": localStorage.getItem("pt_username") || ""
      }
    })
      .then(res => res.json())
      .then(data => {
        setHooks([
          { id: 1, key: 'TEAMS_WEBHOOK', n: 'TEAMS_ALERTS', u: data.TEAMS_WEBHOOK || '', e: 'ON_FAIL, ON_SUCCESS', st: 'ACTIVE' },
          { id: 2, key: 'DISCORD_WEBHOOK', n: 'DISCORD_NOTIFY', u: data.DISCORD_WEBHOOK || '', e: 'ON_FAIL', st: 'ACTIVE' },
          { id: 3, key: 'TELEGRAM_WEBHOOK', n: 'TELEGRAM_PERF', u: data.TELEGRAM_WEBHOOK || '', e: 'ON_START, ON_FINISH', st: 'ACTIVE' },
          { id: 4, key: 'BRRR_WEBHOOK', n: 'BRRR_ALERTS', u: data.BRRR_WEBHOOK || '', e: 'ON_START, ON_FINISH', st: 'DISABLED' },
        ]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load config:", err);
        setLoading(false);
      });
  }, []);

  const updateHookUrl = (id: number, newUrl: string) => {
    setHooks(hooks.map(h => h.id === id ? { ...h, u: newUrl } : h));
  };

  const saveChanges = async () => {
    const payload: Record<string, string> = {};
    hooks.forEach(h => {
      payload[h.key] = h.u;
    });

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("[SYSTEM_NOTICE] Config saved to pt.env successfully.");
      } else {
        alert("[SYSTEM_ERROR] Failed to save config.");
      }
    } catch (err) {
      alert("[SYSTEM_ERROR] Connection error while saving.");
    }
  };

  const testWebhook = async (name: string, url: string) => {
    if (!url || url.trim() === '') {
      alert(`[SYSTEM_ERROR] Please configure and save a URL for ${name} before testing.`);
      return;
    }
    
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: JSON.stringify({ name, targetUrl: url })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`[SYSTEM_NOTICE] Test payload sent successfully to: ${name}\nStatus: ${data.status}`);
      } else {
        alert(`[SYSTEM_ERROR] Webhook test failed for ${name}.\nStatus: ${data.status || 'Unknown'}\nEnsure URL is correct.`);
      }
    } catch (err) {
      alert(`[SYSTEM_ERROR] Failed to execute test webhook: ${err}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full font-mono">
      <header className="border-b-2 border-[#333] pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">WEBHOOK_MGR.SYS</h2>
          <p className="text-[#888] text-xs tracking-widest uppercase">CONFIGURE NOTIFICATIONS AND EXTERNAL TRIGGERS (SYNCED W/ PT.ENV).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={saveChanges} className="flex items-center gap-2 bg-[#111] text-amber-500 border-2 border-[#333] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:border-amber-500 transition-colors">
            <Save className="w-4 h-4" /> SAVE_CHANGES
          </button>
        </div>
      </header>
      <div className="border-2 border-[#333] bg-black">
        {loading ? (
          <div className="p-4 text-emerald-500">LOADING WEBHOOKS...</div>
        ) : (
          <table className="w-full text-left text-xs text-[#aaa]">
            <thead className="bg-[#111] text-[#888] border-b-2 border-[#333]">
              <tr>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333] w-48">[NAME]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333]">[ENDPOINT_URL]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333] w-48">[EVENTS]</th>
                <th className="p-3 font-bold tracking-widest uppercase border-r-2 border-[#333] w-32">[STATUS]</th>
                <th className="p-3 font-bold tracking-widest uppercase w-32">[ACTIONS]</th>
              </tr>
            </thead>
            <tbody>
              {hooks.map((r) => (
                <tr key={r.id} className="border-b border-[#333] hover:bg-[#111] transition-colors focus-within:bg-[#111]">
                  <td className="p-3 border-r-2 border-[#333] font-bold text-cyan-500">{r.n}</td>
                  <td className="p-0 border-r-2 border-[#333]">
                    <input 
                      type="text" 
                      value={r.u} 
                      onChange={(e) => updateHookUrl(r.id, e.target.value)}
                      className="w-full bg-transparent p-3 text-[#aaa] outline-none focus:text-emerald-500 focus:bg-[#1a1a1a] transition-all font-mono"
                      placeholder="Enter webhook URL..."
                    />
                  </td>
                  <td className="p-3 border-r-2 border-[#333] text-amber-500">{r.e}</td>
                  <td className="p-3 border-r-2 border-[#333]">
                    <span className={`px-2 py-1 text-[10px] font-bold tracking-widest border ${r.st === 'ACTIVE' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-[#555] text-[#555] bg-[#333]/10'}`}>
                      {r.st}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => testWebhook(r.n, r.u)}
                      className="flex items-center justify-center gap-1 w-full bg-[#111] border border-[#333] text-cyan-500 px-2 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-colors"
                    >
                      <Zap className="w-3 h-3" /> TEST
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
