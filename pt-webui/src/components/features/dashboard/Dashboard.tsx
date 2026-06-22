import React from 'react';
import { Activity, CheckCircle, Users } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6 font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">METRICS_DASHBOARD.SYS</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">OVERVIEW OF LOAD TESTING METRICS AND SYSTEM HEALTH.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'TOTAL_TESTS', val: '1,248', icon: Activity, color: 'text-amber-500' },
          { title: 'SUCCESS_RATE', val: '98.5%', icon: CheckCircle, color: 'text-emerald-500' },
          { title: 'AVG_VUS', val: '450', icon: Users, color: 'text-cyan-500' }
        ].map((s, i) => (
          <div key={i} className="p-6 bg-black border-2 border-[#333] flex items-center gap-4 hover:border-emerald-500 transition-colors">
            <div className={`p-4 border-2 border-[#333] bg-[#0a0a0a] ${s.color}`}><s.icon className="w-6 h-6" /></div>
            <div>
              <div className="text-xs text-[#888] tracking-widest">{s.title}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 bg-black border-2 border-[#333] flex items-center justify-center text-[#555] font-bold tracking-widest uppercase">
        [METRICS_CHART_PLACEHOLDER]
      </div>
    </div>
  );
}
