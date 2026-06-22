import React from 'react';
import { Play, Activity, History, Settings, Wrench, Webhook } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: 'run', label: 'EXECUTE_TEST', icon: Play },
    { id: 'dashboard', label: 'METRICS_DASHBOARD', icon: Activity },
    { id: 'history', label: 'AUDIT_TRAIL', icon: History },
    { id: 'tools', label: 'SYS_DIAGNOSTICS', icon: Wrench },
    { id: 'webhooks', label: 'WEBHOOK_MGR', icon: Webhook },
    { id: 'settings', label: 'SYS_CONFIG', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#050505] border-r-2 border-[#333] flex flex-col font-mono relative z-20">
      <div className="p-4 border-b-2 border-[#333] flex items-center gap-3">
        <div className="w-3 h-3 bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        <div>
          <h1 className="text-emerald-500 font-bold text-sm tracking-widest uppercase">GROWIN_PT // OS</h1>
          <p className="text-[#888] text-[10px] tracking-widest uppercase">v2.6.0 ONLINE</p>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors border-l-2 ${
                isActive 
                  ? 'bg-[#111] text-emerald-500 border-emerald-500' 
                  : 'text-[#666] border-transparent hover:text-emerald-400 hover:bg-[#0a0a0a]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-bold tracking-widest uppercase">[{tab.label}]</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
