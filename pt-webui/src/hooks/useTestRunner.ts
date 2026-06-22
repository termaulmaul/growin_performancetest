import { useState, useRef } from 'react';
import type { RunConfig } from '../types';

export function useTestRunner() {
  const [target, setTarget] = useState('Oncloud');
  const [script, setScript] = useState('');
  const [config, setConfig] = useState<RunConfig>({
    env: 'STG',
    runby: 'LoadTest',
    platform: 'Web',
    vus: 50,
    duration: '5m',
    scenario: 'All',
    numStart: 1,
    baseUrl: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleConfigChange = (key: keyof RunConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const runSimulation = async () => {
    setIsModalOpen(false);
    setIsRunning(true);
    setLogs([
      `\x1b[36m[INFO]\x1b[0m Initializing k6 environment...`,
      `\x1b[36m[INFO]\x1b[0m Target: ${target} | Env: ${config.env}`,
      `\x1b[36m[INFO]\x1b[0m Executing script: ${script || 'default_script.js'} via pt-webui backend`
    ]);

    try {
      const res = await fetch("http://localhost:3001/api/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, config, target })
      });

      if (!res.ok) {
        setLogs(prev => [...prev, `\x1b[31m[ERROR]\x1b[0m Backend returned status ${res.status}`]);
        setIsRunning(false);
        return;
      }

      if (!res.body) {
         setLogs(prev => [...prev, `\x1b[31m[ERROR]\x1b[0m No response body`]);
         setIsRunning(false);
         return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // Split chunk by lines and add to logs
        const lines = chunk.split('\n').filter(l => l.trim() !== '');
        setLogs(prev => [...prev, ...lines]);
      }

      setLogs(prev => [...prev, `\n\x1b[32m[SUCCESS]\x1b[0m Execution finished.`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `\x1b[31m[ERROR]\x1b[0m Failed to execute test: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    target, setTarget,
    script, setScript,
    config, handleConfigChange,
    isModalOpen, setIsModalOpen,
    isRunning,
    logs, logsEndRef,
    runSimulation
  };
}
