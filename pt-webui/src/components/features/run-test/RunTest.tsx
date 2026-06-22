import React from 'react';
import { Play } from 'lucide-react';
import { TargetSelector } from './TargetSelector';
import { ScriptPicker } from './ScriptPicker';
import { ConfigForm } from './ConfigForm';
import { TerminalPanel } from './TerminalPanel';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { useTestRunner } from '../../../hooks/useTestRunner';

export function RunTest() {
  const {
    target, setTarget,
    script, setScript,
    config, handleConfigChange,
    isModalOpen, setIsModalOpen,
    isRunning,
    logs, logsEndRef,
    runSimulation
  } = useTestRunner();

  return (
    <div className="space-y-6 font-mono">
      <header className="border-b-2 border-[#333] pb-4">
        <h2 className="text-2xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">PERF_TEST_MANAGER.EXE</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">CONFIGURE AND EXECUTE K6 LOAD TESTS ACROSS INFRASTRUCTURE.</p>
      </header>

      <TargetSelector target={target} setTarget={setTarget} />
      <ScriptPicker script={script} setScript={setScript} config={config} handleConfigChange={handleConfigChange} />
      <ConfigForm config={config} handleConfigChange={handleConfigChange} />

      <div className="flex justify-end pt-2">
        <button 
          disabled={!script || isRunning}
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-bold tracking-widest uppercase transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunning ? 'EXECUTING...' : 'INITIATE_SEQUENCE'}</span>
        </button>
      </div>

      <TerminalPanel logs={logs} isRunning={isRunning} logsEndRef={logsEndRef} />

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={runSimulation}
        config={config}
        target={target}
        script={script}
      />
    </div>
  );
}
