import React, { useState } from 'react';
import { Key, Play, Square, Loader, ExternalLink } from 'lucide-react';

export function Settings({ sysStatus }: { sysStatus?: any }) {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStartGrafana = async () => {
    setIsStarting(true);
    try {
      await fetch('http://localhost:3001/api/grafana/start', { method: 'POST' });
    } catch (err) {
      console.error(err);
      setIsStarting(false);
    }
  };

  const handleStopGrafana = async () => {
    setIsStopping(true);
    try {
      await fetch('http://localhost:3001/api/grafana/stop', { method: 'POST' });
    } catch (err) {
      console.error(err);
      setIsStopping(false);
    }
  };

  // Turn off loading states when sysStatus reflects the change
  React.useEffect(() => {
    if (sysStatus?.grafana === 'ON') setIsStarting(false);
    if (sysStatus?.grafana === 'OFF') setIsStopping(false);
  }, [sysStatus?.grafana]);

  return (
    <div className="space-y-6 font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-[#FF9900] mb-1 tracking-widest uppercase">SYS_CONFIG.INI</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">CONFIGURE GLOBAL TEST PARAMETERS AND INTEGRATIONS.</p>
      </header>
      <div className="space-y-4 max-w-2xl">
        <div className="p-6 bg-black border-2 border-[#333] space-y-4">
          <h3 className="text-sm font-bold text-[#FF9900] flex items-center gap-2 tracking-widest uppercase">
            <Key className="w-4 h-4" /> [API_KEYS]
          </h3>
          <div className="space-y-2">
            <label className="text-xs text-[#888] tracking-widest uppercase">DATADOG_API_KEY</label>
            <input type="password" value="****************" readOnly className="w-full bg-[#0a0a0a] border-2 border-[#333] p-3 text-sm text-[#FF9900] outline-none focus:border-[#FF9900] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#888] tracking-widest uppercase">AWS_ACCESS_KEY</label>
            <input type="password" value="****************" readOnly className="w-full bg-[#0a0a0a] border-2 border-[#333] p-3 text-sm text-[#FF9900] outline-none focus:border-[#FF9900] transition-colors" />
          </div>
        </div>

        <div className="p-6 bg-black border-2 border-[#333] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#FF9900] flex items-center gap-2 tracking-widest uppercase">
              <Key className="w-4 h-4" /> [GRAFANA_BACKEND]
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888] tracking-widest uppercase">STATUS:</span>
              <span className={`text-xs font-bold ${sysStatus?.grafana === 'ON' ? 'text-[#4AF626]' : 'text-[#E61919]'}`}>
                ● {sysStatus?.grafana || 'OFF'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button 
              onClick={handleStartGrafana}
              disabled={isStarting || sysStatus?.grafana === 'ON'}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0a0a0a] border-2 border-[#333] hover:border-[#4AF626] hover:text-[#4AF626] text-[#888] p-3 text-xs tracking-widest uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              START BACKEND
            </button>
            <button 
              onClick={handleStopGrafana}
              disabled={isStopping || sysStatus?.grafana === 'OFF'}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0a0a0a] border-2 border-[#333] hover:border-[#E61919] hover:text-[#E61919] text-[#888] p-3 text-xs tracking-widest uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStopping ? <Loader className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              STOP BACKEND
            </button>
          </div>

          <div className="pt-2 border-t border-[#333]">
            {sysStatus?.grafana === 'ON' && sysStatus?.grafanaPort ? (
              <a 
                href={`http://${sysStatus?.ip || '127.0.0.1'}:3001/api/latest-report`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#FF9900] text-black hover:bg-white p-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                OPEN LATEST REPORT HTML
              </a>
            ) : (
              <button 
                disabled
                className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#555] border-2 border-[#333] p-3 text-xs font-bold tracking-widest uppercase transition-colors cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                GRAFANA IS OFF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
