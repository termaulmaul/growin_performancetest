import React, { useState, useEffect } from "react";
import { Clock, Plus, Pause, Play, Trash, RefreshCw } from "lucide-react";

export function Cron() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Job Form
  const [newId, setNewId] = useState("");
  const [newCron, setNewCron] = useState("0 2 * * *");
  const [newScript, setNewScript] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron-jobs', {
        cache: 'no-store',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        }
      });
      const data = await res.json();
      if (data.status === "ok") {
        setJobs(data.data.jobs);
      }
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAction = async (jobId: string, method: string, extra?: any) => {
    try {
      await fetch(`/api/cron-jobs/${jobId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: extra ? JSON.stringify(extra) : undefined
      });
      fetchJobs();
    } catch(e) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/cron-jobs', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: JSON.stringify({ id: newId, cron: newCron, script: newScript })
      });
      setNewId("");
      setNewScript("");
      fetchJobs();
    } catch(e) {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full font-mono">
      <header className="border-b-2 border-[#333] pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-cyan-500 mb-1 tracking-widest uppercase">CRON_SCHEDULER</h2>
          <p className="text-[#888] text-xs tracking-widest uppercase">AUTOMATED TEST EXECUTION ENGINE.</p>
        </div>
        <button onClick={fetchJobs} className="flex items-center gap-2 bg-[#111] text-[#888] border-2 border-[#333] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> REFRESH
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Job List */}
        <div className="lg:col-span-2 border-2 border-[#333] bg-black h-fit">
          <div className="p-4 border-b-2 border-[#333] bg-[#0a0a0a]">
            <h3 className="text-sm font-bold text-cyan-500 flex items-center gap-2 tracking-widest uppercase">
              <Clock className="w-4 h-4" /> [SCHEDULED_JOBS]
            </h3>
          </div>
          {loading ? (
            <div className="p-6 text-[#888]">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#aaa]">
                <thead className="bg-[#111] text-[#888] border-b-2 border-[#333]">
                  <tr>
                    <th className="p-3 border-r-2 border-[#333]">[ID]</th>
                    <th className="p-3 border-r-2 border-[#333]">[CRON]</th>
                    <th className="p-3 border-r-2 border-[#333]">[SCRIPT]</th>
                    <th className="p-3 border-r-2 border-[#333]">[STATUS]</th>
                    <th className="p-3">[ACTIONS]</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-[#555]">NO JOBS SCHEDULED</td></tr>
                  )}
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b border-[#333] hover:bg-[#111] transition-colors">
                      <td className="p-3 border-r-2 border-[#333] font-bold text-white">{j.id}</td>
                      <td className="p-3 border-r-2 border-[#333] text-fuchsia-400">{j.cron}</td>
                      <td className="p-3 border-r-2 border-[#333] text-cyan-400">{j.script}</td>
                      <td className="p-3 border-r-2 border-[#333]">
                        {j.status === "active" ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1"><Play className="w-3 h-3"/> ACTIVE</span>
                        ) : (
                          <span className="text-amber-500 font-bold flex items-center gap-1"><Pause className="w-3 h-3"/> PAUSED</span>
                        )}
                      </td>
                      <td className="p-3 flex gap-2">
                        {j.status === "active" ? (
                          <button onClick={() => handleAction(j.id, "PATCH", { action: "pause" })} className="p-1 hover:text-amber-500"><Pause className="w-4 h-4"/></button>
                        ) : (
                          <button onClick={() => handleAction(j.id, "PATCH", { action: "resume" })} className="p-1 hover:text-emerald-500"><Play className="w-4 h-4"/></button>
                        )}
                        <button onClick={() => { if(confirm("Delete job?")) handleAction(j.id, "DELETE") }} className="p-1 hover:text-red-500"><Trash className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Job */}
        <div className="border-2 border-[#333] bg-black h-fit">
          <div className="p-4 border-b-2 border-[#333] bg-[#0a0a0a]">
            <h3 className="text-sm font-bold text-cyan-500 flex items-center gap-2 tracking-widest uppercase">
              <Plus className="w-4 h-4" /> [NEW_JOB]
            </h3>
          </div>
          <form onSubmit={handleAdd} className="p-6 space-y-4">
            <div>
              <label className="block text-xs text-[#888] tracking-widest uppercase mb-1">JOB_ID</label>
              <input 
                type="text" required value={newId} onChange={e => setNewId(e.target.value)} placeholder="e.g. nightly-regression"
                className="w-full bg-[#111] border border-[#333] p-2 text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] tracking-widest uppercase mb-1">CRON_EXPR</label>
              <input 
                type="text" required value={newCron} onChange={e => setNewCron(e.target.value)}
                className="w-full bg-[#111] border border-[#333] p-2 text-fuchsia-400 outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] tracking-widest uppercase mb-1">SCRIPT_PATH</label>
              <input 
                type="text" required value={newScript} onChange={e => setNewScript(e.target.value)} placeholder="e.g. Script/OMO_Regression.sh"
                className="w-full bg-[#111] border border-[#333] p-2 text-cyan-400 outline-none focus:border-cyan-500"
              />
            </div>
            <button type="submit" disabled={!newId || !newScript} className="w-full bg-cyan-500 text-black font-bold p-2 text-sm tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50">
              SCHEDULE_JOB
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
