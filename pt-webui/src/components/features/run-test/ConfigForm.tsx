import React from 'react';
import type { RunConfig } from '../../../types';

interface ConfigFormProps {
  script: string;
  config: RunConfig;
  handleConfigChange: (key: keyof RunConfig, value: string | number) => void;
}

export function ConfigForm({ script, config, handleConfigChange }: ConfigFormProps) {
  return (
    <section className="space-y-3 z-10 font-mono h-full flex flex-col min-h-0">
      <label className="text-xs font-bold text-emerald-500 tracking-widest flex-none">[RUNTIME_CFG]</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black p-4 border-2 border-[#333] flex-1 min-h-0 overflow-y-auto">
        
        {/* Selects */}
        {[
          { label: 'ENV_NODE', key: 'env' as keyof RunConfig, options: ['INT', 'STG', 'PROD', 'SANDBOX'] },
          { label: 'EXEC_TYPE', key: 'runby' as keyof RunConfig, options: ['Manual', 'LoadTest', 'Regression'] },
          { label: 'TARGET_PLATFORM', key: 'platform' as keyof RunConfig, options: ['Web', 'Android', 'iOS', 'API'] },
        ].map(field => (
          <div key={field.key} className="space-y-1">
            <label className="text-[10px] text-[#888] font-bold uppercase">{field.label}</label>
            <select 
              value={config[field.key]}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500 cursor-pointer uppercase"
            >
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}

        {/* Number Inputs */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#888] font-bold uppercase">CONCURRENT_VUS</label>
          <input 
            type="number"
            value={config.vus === 0 && config.vus.toString() === "0" ? config.vus : (config.vus || '')}
            onChange={(e) => handleConfigChange('vus', e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
            className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500"
          />
        </div>

        {/* Text Inputs */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#888] font-bold uppercase">DURATION_STR</label>
          <input 
            type="text"
            value={config.duration}
            onChange={(e) => handleConfigChange('duration', e.target.value)}
            className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-[#888] font-bold uppercase">SCENARIO_ID</label>
          {(() => {
            // Extract suite name from script (e.g. "Growin_OMO/Web/Growin_OMO.js" -> "Growin_OMO")
            const suite = script ? script.split('/')[0] : '';
            const platform = config.platform;
            
            // Scan for BP files
            const modules = import.meta.glob('../../../../../Script/**/BP[0-9]*.js', { query: '?url', import: 'default' });
            const bps = Object.keys(modules)
              .map(p => p.replace('../../../../../Script/', ''))
              .filter(p => p.startsWith(`${suite}/`) && p.includes(`/${platform}/`))
              .map(p => p.split('/').pop()?.replace('.js', '') || '');
            
            // Deduplicate and sort
            const uniqueBps = [...new Set(bps)].sort();
            
            if (uniqueBps.length > 0) {
              return (
                <select 
                  value={config.scenario}
                  onChange={(e) => handleConfigChange('scenario', e.target.value)}
                  className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500 cursor-pointer uppercase"
                >
                  <option value="All">All Scenarios</option>
                  {uniqueBps.map(bp => <option key={bp} value={bp}>{bp}</option>)}
                </select>
              );
            }

            // Fallback if no BPs found or no script selected
            return (
              <input 
                type="text"
                value={config.scenario}
                onChange={(e) => handleConfigChange('scenario', e.target.value)}
                placeholder="BP001,BP002 or All"
                className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500 uppercase"
              />
            );
          })()}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-[#888] font-bold uppercase">USER_OFFSET</label>
          <input 
            type="number"
            value={config.numStart}
            onChange={(e) => handleConfigChange('numStart', parseInt(e.target.value) || 0)}
            className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1 sm:col-span-2 mt-2">
            <label className="text-[10px] text-[#888] font-bold uppercase">BASE_URL_OVERRIDE</label>
            <input 
              type="text"
              placeholder="https://api.staging.example.com"
              value={config.baseUrl}
              onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
              className="w-full bg-[#111] border-2 border-[#333] p-2 text-xs text-amber-500 font-bold outline-none focus:border-emerald-500 placeholder-[#444]"
            />
        </div>
      </div>
    </section>
  );
}
