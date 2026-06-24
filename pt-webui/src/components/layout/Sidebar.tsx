import React from 'react';
import { Play, Activity, History, Settings, Wrench, Webhook, LogOut, Users, Clock } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, user }: { activeTab: string, setActiveTab: (t: string) => void, user: { username: string, role: string } }) {
  const tabs = [
    { id: 'run', label: 'EXECUTE_TEST', icon: Play, allowed: ['god', 'admin', 'operator'] },
    { id: 'dashboard', label: 'METRICS_DASHBOARD', icon: Activity, allowed: ['god', 'admin', 'operator', 'readonly', 'guest'] },
    { id: 'history', label: 'AUDIT_TRAIL', icon: History, allowed: ['god', 'admin', 'operator', 'readonly', 'guest'] },
    { id: 'diagnostics', label: 'SYS_DIAGNOSTICS', icon: Wrench, allowed: ['god', 'admin', 'operator', 'readonly'] },
    { id: 'integrations', label: 'WEBHOOK_MGR', icon: Webhook, allowed: ['god', 'admin'] },
    { id: 'settings', label: 'SYS_CONFIG', icon: Settings, allowed: ['god', 'admin', 'operator'] },
    { id: 'users', label: 'USER_MGR', icon: Users, allowed: ['god', 'admin'] },
    { id: 'cron', label: 'CRON_SCHEDULER', icon: Clock, allowed: ['god', 'admin'] },
  ].filter(t => t.allowed.includes(user.role));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username })
      });
    } catch(e) {}
    localStorage.removeItem("pt_token");
    localStorage.removeItem("pt_username");
    window.location.reload();
  };

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
      
      <div className="p-4 border-t-2 border-[#333]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors text-red-500 hover:bg-[#111] border-l-2 border-transparent hover:border-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-bold tracking-widest uppercase">[LOGOUT]</span>
        </button>
      </div>
    </div>
  );
}
