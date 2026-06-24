import React, { useState } from "react";

export function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.status === "ok") {
        onLogin(data.data);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a] font-mono">
      <div className="p-8 bg-black border-2 border-[#333] w-96">
        <h2 className="text-2xl font-bold text-emerald-500 mb-6 tracking-widest uppercase">AUTH_GATE.SYS</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#888] text-xs mb-1">USERNAME</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full bg-[#111] border border-[#333] p-2 text-[#aaa] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[#888] text-xs mb-1">PASSWORD</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-[#111] border border-[#333] p-2 text-[#aaa] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button type="submit" className="w-full bg-[#111] border-2 border-[#333] p-2 text-emerald-500 hover:bg-[#222] hover:border-emerald-500 transition-colors tracking-widest font-bold">
            AUTHENTICATE
          </button>
        </form>
      </div>
    </div>
  );
}
