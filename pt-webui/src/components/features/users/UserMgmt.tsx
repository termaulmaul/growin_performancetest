import React, { useState, useEffect } from "react";
import { Users, Lock, Unlock, Shield, Key, Trash, Plus, RefreshCw } from "lucide-react";

export function UserMgmt({ user }: { user: { username: string, role: string } }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create user form
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState("readonly");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        cache: 'no-store',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        }
      });
      const data = await res.json();
      if (data.status === "ok") {
        setUsers(data.data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Error connecting to server");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (targetUser: string, action: string, extra?: any) => {
    try {
      let url = `/api/users/${targetUser}`;
      let method = "PATCH";
      if (action === "delete") method = "DELETE";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: method === "PATCH" ? JSON.stringify({ action, ...extra }) : undefined
      });
      
      const data = await res.json();
      if (data.status === "ok") {
        fetchUsers();
      } else {
        alert("Failed: " + data.error);
      }
    } catch (err) {
      alert("Error: " + err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pt_token")}`,
          "x-username": localStorage.getItem("pt_username") || ""
        },
        body: JSON.stringify({ username: newUser, password: newPass, role: newRole })
      });
      const data = await res.json();
      if (data.status === "ok") {
        setNewUser("");
        setNewPass("");
        fetchUsers();
      } else {
        alert("Failed to create user: " + data.error);
      }
    } catch (err) {
      alert("Error creating user");
    }
  };

  if (user.role !== "god" && user.role !== "admin") {
    return <div className="p-8 text-red-500 font-bold uppercase tracking-widest">[ACCESS DENIED] User management requires admin privileges.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full font-mono">
      <header className="border-b-2 border-[#333] pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-fuchsia-500 mb-1 tracking-widest uppercase">USER_MGR.SYS</h2>
          <p className="text-[#888] text-xs tracking-widest uppercase">ACCESS CONTROL AND ACCOUNT MANAGEMENT.</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 bg-[#111] text-[#888] border-2 border-[#333] px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> REFRESH
        </button>
      </header>

      {error && <div className="text-red-500 bg-red-950/20 p-4 border border-red-900">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User List */}
        <div className="lg:col-span-2 border-2 border-[#333] bg-black h-fit">
          <div className="p-4 border-b-2 border-[#333] bg-[#0a0a0a]">
            <h3 className="text-sm font-bold text-fuchsia-500 flex items-center gap-2 tracking-widest uppercase">
              <Users className="w-4 h-4" /> [REGISTERED_USERS]
            </h3>
          </div>
          {loading ? (
            <div className="p-6 text-[#888]">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#aaa]">
                <thead className="bg-[#111] text-[#888] border-b-2 border-[#333]">
                  <tr>
                    <th className="p-3 border-r-2 border-[#333]">[USERNAME]</th>
                    <th className="p-3 border-r-2 border-[#333]">[ROLE]</th>
                    <th className="p-3 border-r-2 border-[#333]">[STATUS]</th>
                    <th className="p-3 border-r-2 border-[#333]">[LAST_LOGIN]</th>
                    <th className="p-3">[ACTIONS]</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.username} className="border-b border-[#333] hover:bg-[#111] transition-colors">
                      <td className="p-3 border-r-2 border-[#333] font-bold text-cyan-500">{u.username}</td>
                      <td className="p-3 border-r-2 border-[#333]">
                        <select 
                          value={u.role}
                          onChange={(e) => handleAction(u.username, "assign-role", { role: e.target.value })}
                          className="bg-transparent border border-[#333] p-1 text-[#aaa] outline-none hover:border-fuchsia-500 focus:text-white"
                          disabled={user.role !== "god" && u.role === "god"}
                        >
                          <option value="god">GOD</option>
                          <option value="admin">ADMIN</option>
                          <option value="operator">OPERATOR</option>
                          <option value="readonly">READONLY</option>
                          <option value="guest">GUEST</option>
                        </select>
                      </td>
                      <td className="p-3 border-r-2 border-[#333]">
                        {u.is_locked ? (
                          <span className="text-red-500 font-bold flex items-center gap-1"><Lock className="w-3 h-3"/> LOCKED ({u.failed_attempts})</span>
                        ) : (
                          <span className="text-emerald-500 flex items-center gap-1"><Unlock className="w-3 h-3"/> ACTIVE</span>
                        )}
                      </td>
                      <td className="p-3 border-r-2 border-[#333] text-[#555]">{u.last_login?.split('.')[0] || 'NEVER'}</td>
                      <td className="p-3 flex gap-2">
                        {u.is_locked ? (
                          <button onClick={() => handleAction(u.username, "unlock")} className="p-1 hover:text-emerald-500" title="Unlock"><Unlock className="w-4 h-4"/></button>
                        ) : (
                          <button onClick={() => handleAction(u.username, "lock")} className="p-1 hover:text-red-500" title="Lock"><Lock className="w-4 h-4"/></button>
                        )}
                        <button 
                          onClick={() => {
                            const pwd = prompt("Enter new password for " + u.username);
                            if (pwd) handleAction(u.username, "reset-password", { password: pwd });
                          }} 
                          className="p-1 hover:text-amber-500" title="Reset Password"><Key className="w-4 h-4"/></button>
                        <button onClick={() => { if(confirm("Delete " + u.username + "?")) handleAction(u.username, "delete") }} className="p-1 hover:text-red-500" title="Delete"><Trash className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User */}
        <div className="border-2 border-[#333] bg-black h-fit">
          <div className="p-4 border-b-2 border-[#333] bg-[#0a0a0a]">
            <h3 className="text-sm font-bold text-fuchsia-500 flex items-center gap-2 tracking-widest uppercase">
              <Plus className="w-4 h-4" /> [PROVISION_NEW_ACCOUNT]
            </h3>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <div>
              <label className="block text-xs text-[#888] tracking-widest uppercase mb-1">USERNAME</label>
              <input 
                type="text" required value={newUser} onChange={e => setNewUser(e.target.value)}
                className="w-full bg-[#111] border border-[#333] p-2 text-white outline-none focus:border-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] tracking-widest uppercase mb-1">PASSWORD</label>
              <input 
                type="password" required value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full bg-[#111] border border-[#333] p-2 text-white outline-none focus:border-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs text-[#888] tracking-widest uppercase mb-1">INITIAL_ROLE</label>
              <select 
                value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full bg-[#111] border border-[#333] p-2 text-white outline-none focus:border-fuchsia-500"
              >
                <option value="admin">ADMIN</option>
                <option value="operator">OPERATOR</option>
                <option value="readonly">READONLY</option>
                <option value="guest">GUEST</option>
              </select>
            </div>
            <button type="submit" disabled={!newUser || !newPass} className="w-full bg-fuchsia-500 text-black font-bold p-2 text-sm tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50">
              CREATE_ACCOUNT
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
