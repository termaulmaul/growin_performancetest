import React, { useState, useEffect } from "react";
import { Key, Save, Loader, ExternalLink, Play, Square, Activity, Terminal, FileText, X } from "lucide-react";

export function Settings({ sysStatus }: { sysStatus?: any }) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isGeneratingDummy, setIsGeneratingDummy] = useState(false);
  const [logs, setLogs] = useState("");
  const [showLogs, setShowLogs] = useState(false);
  const [message, setMessage] = useState("");

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config', {
        cache: 'no-store',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        }
      });
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch('/api/config', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setMessage("Config saved successfully.");
      } else {
        setMessage("Failed to save config.");
      }
    } catch (err) {
      setMessage("Error saving config.");
    }
    setIsSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleStartGrafana = async () => {
    setIsStarting(true);
    try {
      await fetch('/api/grafana/start', { method: "POST" });
    } catch (err) {
      setIsStarting(false);
    }
  };

  const handleStopGrafana = async () => {
    setIsStopping(true);
    try {
      await fetch('/api/grafana/stop', { method: "POST" });
    } catch (err) {
      setIsStopping(false);
    }
  };

  const handleViewLogs = async () => {
    try {
      const res = await fetch('/api/grafana/logs', { cache: 'no-store' });
      const data = await res.json();
      setLogs(data.output);
      setShowLogs(true);
    } catch (err) {
      setLogs("Error fetching logs");
      setShowLogs(true);
    }
  };

  const handleDummyReport = async () => {
    setIsGeneratingDummy(true);
    try {
      const res = await fetch('/api/grafana/dummy-report', { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage("Dummy report generated.");
        window.open('/api/grafana/view-dummy', "_blank");
      } else {
        setMessage("Failed to generate dummy report.");
      }
    } catch (err) {
      setMessage("Error generating dummy report.");
    }
    setIsGeneratingDummy(false);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    if (sysStatus?.grafana === "ON") setIsStarting(false);
    if (sysStatus?.grafana === "OFF") setIsStopping(false);
  }, [sysStatus?.grafana]);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full font-mono">
      <header className="border-b-2 border-[#333] pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#FF9900] mb-1 tracking-widest uppercase">SYS_CONFIG.INI</h2>
          <p className="text-[#888] text-xs tracking-widest uppercase">CONFIGURE GLOBAL TEST PARAMETERS AND INTEGRATIONS.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 bg-[#FF9900] text-black hover:bg-white px-6 py-2 text-sm font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SAVE CONFIG
        </button>
      </header>

      {message && <div className="text-emerald-400 text-sm font-bold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-black border-2 border-[#333] space-y-4">
          <h3 className="text-sm font-bold text-[#FF9900] flex items-center gap-2 tracking-widest uppercase">
            <Key className="w-4 h-4" /> [ENVIRONMENT_VARS]
          </h3>
          {isLoading ? (
            <div className="text-[#888]">Loading config...</div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(config).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-[#888] tracking-widest uppercase">{k}</label>
                  <input 
                    type={k.includes("PASS") || k.includes("PIN") ? "password" : "text"} 
                    value={v} 
                    onChange={e => handleChange(k, e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333] p-2 text-sm text-[#FF9900] outline-none focus:border-[#FF9900] transition-colors" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-black border-2 border-[#333] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#FF9900] flex items-center gap-2 tracking-widest uppercase">
                <Activity className="w-4 h-4" /> [GRAFANA_BACKEND]
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#888] tracking-widest uppercase">STATUS:</span>
                <span className={`text-xs font-bold ${sysStatus?.grafana === "ON" ? "text-[#4AF626]" : "text-[#E61919]"}`}>
                  ● {sysStatus?.grafana || "OFF"}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              {sysStatus?.grafana === "ON" ? (
                <button 
                  onClick={handleStopGrafana}
                  disabled={isStopping}
                  className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#333] hover:border-[#E61919] hover:text-[#E61919] text-[#E61919] p-3 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {isStopping ? <Loader className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                  STOP
                </button>
              ) : (
                <button 
                  onClick={handleStartGrafana}
                  disabled={isStarting}
                  className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#333] hover:border-[#4AF626] hover:text-[#4AF626] text-[#4AF626] p-3 text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                >
                  {isStarting ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  START
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-[#333] space-y-2">
              <button 
                onClick={handleViewLogs}
                className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#333] hover:border-[#FF9900] hover:text-[#FF9900] text-[#888] p-3 text-xs tracking-widest uppercase transition-colors"
              >
                <Terminal className="w-4 h-4" />
                VIEW LOGS
              </button>

              <button 
                onClick={handleDummyReport}
                disabled={isGeneratingDummy}
                className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#333] hover:border-[#FF9900] hover:text-[#FF9900] text-[#888] p-3 text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
              >
                {isGeneratingDummy ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                GENERATE DUMMY REPORT
              </button>

              {sysStatus?.grafana === "ON" && sysStatus?.grafanaPort ? (
                <a 
                  href={`/api/latest-report`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#FF9900] text-black hover:bg-white p-3 text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  LATEST REPORT
                </a>
              ) : (
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-[#555] border border-[#333] p-3 text-xs font-bold tracking-widest uppercase transition-colors cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                  GRAFANA IS OFF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogs && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#0a0a0a] border border-[#333] w-full max-w-3xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#FF9900] tracking-widest uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4" /> GRAFANA LOGS
              </h3>
              <button 
                onClick={() => setShowLogs(false)}
                className="text-[#888] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <pre className="text-xs font-mono text-[#00FF00] whitespace-pre-wrap">{logs}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
