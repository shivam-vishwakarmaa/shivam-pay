import React from "react";

export default function SendMoneyForm({ sendForm, setSend, handleSend, txnState, StatusBar, users, searchQ, setSearch }) {
  const fUsers = users.filter(u => !searchQ || u.name?.toLowerCase().includes(searchQ.toLowerCase()) || u.username?.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div className="card" style={{ marginBottom: 24, padding: 26 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#171717" }}>Send Money to Any Peer</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#667085" }}>Transfer real funds instantly with zero processing delays using your 4-digit security PIN.</p>
        
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
          <div>
            <label className="label">Recipient Username</label>
            <input className="input" required placeholder="Enter username (e.g. rahul_kumar)" value={sendForm.receiverIdentifier} onChange={e => setSend({ ...sendForm, receiverIdentifier: e.target.value })} />
          </div>
          <div>
            <label className="label">Transfer Amount (₹)</label>
            <input className="input" type="number" step="0.01" min="1" required placeholder="0.00"
              style={{ fontSize: 20, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}
              value={sendForm.amount} onChange={e => setSend({ ...sendForm, amount: e.target.value })} />
          </div>
          <div>
            <label className="label">Transfer Note (optional)</label>
            <input className="input" placeholder="What is this transfer for?" value={sendForm.description} onChange={e => setSend({ ...sendForm, description: e.target.value })} />
          </div>
          <div>
            <label className="label">4-Digit Security PIN</label>
            <input className="input" type="password" maxLength={4} required placeholder="••••"
              style={{ maxWidth: 140, textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8, fontWeight: 700 }}
              value={sendForm.pin} onChange={e => setSend({ ...sendForm, pin: e.target.value.replace(/\D/g, "") })} />
          </div>
          <StatusBar />
          <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.s === "loading"} style={{ marginTop: 4, width: "100%" }}>
            {txnState.s === "loading" ? "Processing Transfer..." : "Confirm & Send Money →"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#171717" }}>ShivamPay Network Directory</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#667085" }}>Select any verified user below to prefill transfer details</p>
          </div>
          <input className="input" style={{ width: 220, fontSize: 13, padding: "8px 12px", borderRadius: 9999 }} placeholder="Search users by name..." value={searchQ} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Verified Account</th><th>Username</th><th style={{ textAlign: "right" }}>Quick Action</th></tr></thead>
            <tbody>
              {fUsers.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center", color: "#888888", padding: 36, fontSize: 13.5 }}>{users.length === 0 ? "No other users currently registered in network." : "No matching users found."}</td></tr>
              ) : fUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#171717" }}>{u.name?.charAt(0) || "U"}</div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13.5, color: "#667085", fontFamily: "'JetBrains Mono', monospace" }}>@{u.username}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-sm btn-outline" style={{ borderRadius: 9999, fontWeight: 600 }} onClick={() => { setSend({ ...sendForm, receiverIdentifier: u.username }); window.scrollTo(0, 0); }}>Select & Pay</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
