import React from 'react';
import { Terminal } from 'lucide-react';

interface TerminalPanelProps {
  logs: string[];
  isRunning: boolean;
  logsEndRef: React.RefObject<HTMLDivElement | null>;
}

export function TerminalPanel({ logs, isRunning, logsEndRef }: TerminalPanelProps) {
  return (
    <section className="mt-8 border-2 border-[#333] bg-[#0a0a0a] flex flex-col h-72">
      <div className="flex items-center justify-between px-4 py-1 bg-[#1a1a1a] border-b-2 border-[#333]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-[#888] font-bold tracking-widest uppercase">TTY_01 // K6_ENGINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold ${isRunning ? 'text-emerald-500 animate-pulse' : 'text-[#555]'}`}>
            {isRunning ? 'EXECUTING' : 'IDLE'}
          </span>
          <div className={`w-2 h-2 ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-[#555]'}`}></div>
        </div>
      </div>
      <div className="p-4 text-xs overflow-y-auto flex-1 text-emerald-400">
        {logs.length === 0 ? (
          <span className="text-[#555]">AWAITING CMD...</span>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1 leading-relaxed whitespace-pre-wrap">
              <span className="text-amber-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              <span dangerouslySetInnerHTML={{ 
                __html: log.replace(/\x1b\[32m/g, '<span class="text-green-500 font-bold">')
                           .replace(/\x1b\[36m/g, '<span class="text-cyan-500 font-bold">')
                           .replace(/\x1b\[33m/g, '<span class="text-amber-500 font-bold">')
                           .replace(/\x1b\[31m/g, '<span class="text-red-500 font-bold">')
                           .replace(/\x1b\[0m/g, '</span>')
              }} />
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </section>
  );
}
