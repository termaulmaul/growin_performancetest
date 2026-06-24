import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu, HardDrive } from 'lucide-react';

export function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = () => {
      fetch('/api/resmon', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data && data.status === 'ok') {
            setMetrics(data.data);
          }
        })
        .catch(console.error);
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">METRICS_DASHBOARD.SYS</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">OVERVIEW OF LOAD TESTING METRICS AND SYSTEM HEALTH.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-black border-2 border-[#333] flex items-center gap-4 hover:border-emerald-500 transition-colors">
          <div className="p-4 border-2 border-[#333] bg-[#0a0a0a] text-cyan-500"><Activity className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-[#888] tracking-widest">HEALTH_SCORE</div>
            <div className="text-2xl font-bold text-cyan-500">{metrics ? metrics.health_score : '--'}</div>
          </div>
        </div>
        <div className="p-6 bg-black border-2 border-[#333] flex items-center gap-4 hover:border-emerald-500 transition-colors">
          <div className="p-4 border-2 border-[#333] bg-[#0a0a0a] text-amber-500"><Cpu className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-[#888] tracking-widest">CPU_USAGE</div>
            <div className="text-2xl font-bold text-amber-500">{metrics ? `${metrics.cpu_percent}%` : '--'}</div>
          </div>
        </div>
        <div className="p-6 bg-black border-2 border-[#333] flex items-center gap-4 hover:border-emerald-500 transition-colors">
          <div className="p-4 border-2 border-[#333] bg-[#0a0a0a] text-emerald-500"><HardDrive className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-[#888] tracking-widest">MEMORY_USAGE</div>
            <div className="text-2xl font-bold text-emerald-500">{metrics ? `${metrics.mem_percent}%` : '--'}</div>
          </div>
        </div>
        <div className="p-6 bg-black border-2 border-[#333] flex items-center gap-4 hover:border-emerald-500 transition-colors">
          <div className="p-4 border-2 border-[#333] bg-[#0a0a0a] text-purple-500"><Server className="w-6 h-6" /></div>
          <div>
            <div className="text-xs text-[#888] tracking-widest">K6_PROCESSES</div>
            <div className="text-2xl font-bold text-purple-500">{metrics ? metrics.k6_running : '--'}</div>
          </div>
        </div>
      </div>
      <div className="h-64 bg-black border-2 border-[#333] flex flex-col p-4 text-[#aaa] font-mono">
        <h3 className="text-lg font-bold text-emerald-500 mb-2 uppercase">System Details</h3>
        {metrics ? (
          <div className="space-y-2">
            <div><span className="text-cyan-500">Memory Total:</span> {metrics.mem_total_gb} GB</div>
            <div><span className="text-cyan-500">Memory Used:</span> {metrics.mem_used_gb} GB</div>
            <div><span className="text-cyan-500">Load Average:</span> {metrics.load_avg.join(', ')}</div>
            <div><span className="text-cyan-500">Docker Containers:</span> {metrics.docker_running} running</div>
          </div>
        ) : (
          <div>Loading details...</div>
        )}
      </div>
    </div>
  );
}
