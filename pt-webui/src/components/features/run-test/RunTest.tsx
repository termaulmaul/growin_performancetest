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
    <div className="flex flex-col flex-1 max-w-6xl mx-auto w-full font-mono gap-4 min-h-0">
      <header className="border-b-2 border-[#333] pb-3 flex-none">
        <h2 className="text-xl font-bold text-emerald-500 mb-1 tracking-widest uppercase">PERF_TEST_MANAGER.EXE</h2>
        <p className="text-[#888] text-xs tracking-widest uppercase">CONFIGURE AND EXECUTE K6 LOAD TESTS ACROSS INFRASTRUCTURE.</p>
      </header>

      <div className="flex-none">
        <TargetSelector target={target} setTarget={setTarget} />
      </div>
      <div className="flex-none">
        <ScriptPicker script={script} setScript={setScript} config={config} handleConfigChange={handleConfigChange} />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <ConfigForm script={script} config={config} handleConfigChange={handleConfigChange} />
        </div>
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <TerminalPanel logs={logs} isRunning={isRunning} logsEndRef={logsEndRef} />
        </div>
      </div>

      <div className="flex justify-end gap-4 flex-none">
        <button 
          disabled={isRunning}
          onClick={() => {
            if(confirm("Run Batch Regression? This will execute Regression.sh")) {
              setScript("Regression.sh");
              setIsModalOpen(true);
            }
          }}
          className="group relative flex items-center gap-2 px-6 py-3 bg-[#111] hover:bg-[#222] text-[#888] hover:text-white font-bold tracking-widest uppercase transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#333] overflow-hidden"
        >
          <Play className="w-4 h-4 fill-current text-fuchsia-500" />
          <span>BATCH_REGRESSION</span>
        </button>
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
