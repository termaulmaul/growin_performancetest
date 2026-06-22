import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { RunConfig } from '../../../types';

interface ScriptPickerProps {
  script: string;
  setScript: (s: string) => void;
  config: RunConfig;
  handleConfigChange: (key: keyof RunConfig, value: string | number) => void;
}

export function ScriptPicker({ script, setScript, handleConfigChange }: ScriptPickerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const modules = import.meta.glob('../../../../../Script/**/*.{js,sh}', { query: '?url', import: 'default' });
  const realScripts = Object.keys(modules)
    .map(p => p.replace('../../../../../Script/', ''))
    .filter(p => !p.includes('copy') && !p.includes('?'));

  const filteredScripts = realScripts.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleScriptSelect = (s: string) => {
    setScript(s);
    setIsDropdownOpen(false);

    // Auto-detect platform from path if possible (e.g. Suite/Web/Script.js)
    const parts = s.split('/');
    if (parts.length >= 3) {
      const maybePlatform = parts[parts.length - 2];
      if (['Web', 'iOS', 'Android', 'API'].includes(maybePlatform)) {
        handleConfigChange('platform', maybePlatform);
      }
    }
  };

  return (
    <section className="space-y-3 relative z-20 font-mono">
      <label className="text-xs font-bold text-emerald-500 tracking-widest">[TARGET_SCRIPT]</label>
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-black border-2 border-[#333] hover:border-[#555] transition-colors focus:outline-none focus:border-emerald-500"
        >
          <span className={script ? 'text-amber-400 font-bold' : 'text-[#666]'}>
            {script || 'AWAITING SELECTION...'}
          </span>
          <ChevronDown className={`w-4 h-4 text-emerald-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-black border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden">
            <div className="p-2 border-b-2 border-[#333] flex items-center gap-2 bg-[#111]">
              <Search className="w-4 h-4 text-emerald-500" />
              <input 
                type="text" 
                placeholder="SEARCH_INDEX..." 
                className="bg-transparent border-none outline-none w-full text-xs text-amber-500 placeholder-[#666] font-bold uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {filteredScripts.map(s => (
                <button
                  key={s}
                  onClick={() => handleScriptSelect(s)}
                  className="w-full text-left px-2 py-1.5 hover:bg-emerald-500 hover:text-black text-xs text-amber-500 transition-colors font-bold"
                >
                  {s}
                </button>
              ))}
              {filteredScripts.length === 0 && <div className="p-2 text-xs text-[#666] text-center">NO_RECORDS_FOUND</div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
