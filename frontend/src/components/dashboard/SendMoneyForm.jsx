import React from "react";

export default function SendMoneyForm({ sendForm, setSend, handleSend, txnState, StatusBar, users, searchQ, setSearch }) {
  const fUsers = users.filter(u => !searchQ || u.name?.toLowerCase().includes(searchQ.toLowerCase()) || u.username?.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <div className="card" style={{ marginBottom: 20, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Transfer Money</h3>
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 400 }}>
          <div>
            <label className="label">Recipient Username</label>
            <input className="input" required placeholder="Enter username" value={sendForm.receiverIdentifier} onChange={e => setSend({ ...sendForm, receiverIdentifier: e.target.value })} />
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input className="input" type="number" step="0.01" min="1" required placeholder="0.00"
              style={{ fontSize: 18, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}
              value={sendForm.amount} onChange={e => setSend({ ...sendForm, amount: e.target.value })} />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input className="input" placeholder="What's this for?" value={sendForm.description} onChange={e => setSend({ ...sendForm, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Security PIN</label>
            <input className="input" type="password" maxLength={4} required placeholder="••••"
              style={{ maxWidth: 120, textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
              value={sendForm.pin} onChange={e => setSend({ ...sendForm, pin: e.target.value })} />
          </div>
          <StatusBar />
          <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.s === "loading"} style={{ alignSelf: "flex-start" }}>
            {txnState.s === "loading" ? "Sending..." : "Send Money"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>ShivamPay Users</h3>
          <input className="input" style={{ width: 180, fontSize: 12 }} placeholder="Search users..." value={searchQ} onChange={e => setSearch(e.target.value)} />
        </div>
        <table className="table">
          <thead><tr><th>User</th><th>Username</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
          <tbody>
            {fUsers.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: "center", color: "#98a2b3", padding: 30 }}>{users.length === 0 ? "No other users found." : "No matching users."}</td></tr>
            ) : fUsers.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#3b5bdb" }}>{u.name?.charAt(0) || "U"}</div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: "#667085" }}>@{u.username}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-sm btn-outline" onClick={() => { setSend({ ...sendForm, receiverIdentifier: u.username }); window.scrollTo(0, 0); }}>Send</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
