import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { RunTest } from './components/features/run-test/RunTest';
import { Dashboard } from './components/features/dashboard/Dashboard';
import { History } from './components/features/history/History';
import { Tools } from './components/features/tools/Tools';
import { Settings } from './components/features/settings/Settings';
import { Webhooks } from './components/features/webhooks/Webhooks';
import { Login } from './components/features/auth/Login';
import { UserMgmt } from './components/features/users/UserMgmt';
import { Cron } from './components/features/cron/Cron';

export default function App() {
  const [activeTab, setActiveTab] = useState('run');
  const [user, setUser] = useState<{username: string, role: string} | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [sysStatus, setSysStatus] = useState({
    ip: '127.0.0.1',
    webhooks: 'OFF',
    grafana: 'OFF',
    k6: 'IDLE',
    lastRun: 'none'
  });

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('pt_token');
      const username = localStorage.getItem('pt_username');
      if (!token || !username) {
        setIsLoadingAuth(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/session', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-username': username
          }
        });
        const data = await res.json();
        if (data.status === 'ok') {
          setUser(data.data);
        } else {
          localStorage.removeItem('pt_token');
          localStorage.removeItem('pt_username');
        }
      } catch (err) {
        // Assume failure if backend down
      }
      setIsLoadingAuth(false);
    };
    verifySession();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/sys-status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setSysStatus(data);
        }
      } catch (err) {
        // Silently fail if backend is down
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [user]);

  if (isLoadingAuth) {
    return <div className="flex h-screen bg-[#121212] items-center justify-center text-[#FF9900] font-mono">LOADING_AUTH...</div>;
  }

  if (!user) {
    return <Login onLogin={(data) => {
      localStorage.setItem('pt_token', data.token);
      localStorage.setItem('pt_username', data.username);
      // We don't have the role from login response, so we just trigger a verify or set a dummy role
      // Actually pt-auth login doesn't return role, so let's just trigger a reload to run verifySession
      window.location.reload();
    }} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#121212] text-[#FF9900] font-mono overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

        <main className={`flex-1 flex flex-col h-full relative ${activeTab === 'run' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className="p-4 md:p-6 w-full z-10 flex flex-col flex-1 min-h-0">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'history' && <History />}
            {activeTab === 'diagnostics' && <Tools />}
            {activeTab === 'integrations' && <Webhooks />}
            {activeTab === 'settings' && <Settings sysStatus={sysStatus} />}
            {activeTab === 'users' && <UserMgmt user={user} />}
            {activeTab === 'cron' && <Cron />}
            
            <div className={activeTab === 'run' ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
              <RunTest />
            </div>
          </div>
        </main>
      </div>

      {/* Global Terminal Footer */}
      <footer className="border-t-2 border-[#333] bg-[#0a0a0a] text-xs p-2 shrink-0 z-30 font-bold whitespace-nowrap overflow-hidden">
        <div className="flex justify-between items-center px-4 flex-nowrap w-full">
          <div className="flex gap-3 overflow-hidden">
            <div className="truncate"><span className="text-[#888] uppercase">[USER]</span> <span className="text-[#FF9900]">{user.username.toUpperCase()}</span> <span className="text-[#888]">·</span> <span className="text-purple-400">{user.role.toUpperCase()}</span></div>
            <div><span className="text-[#888] uppercase">[IP]</span> <span className="text-cyan-400 ml-1">{sysStatus.ip}</span></div>
            <div>
              <span className="text-[#888] uppercase">[WEBHOOK]</span> 
              <span className={sysStatus.webhooks === 'ON' ? "text-[#4AF626] ml-1" : "text-[#E61919] ml-1"}>● {sysStatus.webhooks}</span>
            </div>
            <div>
              <span className="text-[#888] uppercase">[GRAFANA]</span> 
              <span className={sysStatus.grafana === 'ON' ? "text-[#4AF626] ml-1" : "text-[#E61919] ml-1"}>● {sysStatus.grafana}</span>
            </div>
            <div>
              <span className="text-[#888] uppercase">[K6_ENGINE]</span> 
              <span className={sysStatus.k6.startsWith('RUNNING') ? "text-[#4AF626] ml-1 animate-pulse" : "text-[#888] ml-1"}>{sysStatus.k6}</span>
            </div>
          </div>
          <div className="text-right truncate ml-4 shrink-0">
            <span className="text-[#888] uppercase">[LAST_RUN]</span> 
            {sysStatus.lastRun.includes('✓') ? (
               <span className="text-[#4AF626] ml-1">{sysStatus.lastRun}</span>
            ) : sysStatus.lastRun.includes('✘') ? (
               <span className="text-[#E61919] ml-1">{sysStatus.lastRun}</span>
            ) : (
               <span className="text-[#555] ml-1">{sysStatus.lastRun}</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
