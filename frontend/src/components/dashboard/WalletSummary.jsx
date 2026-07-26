import React from "react";

export default function WalletSummary({ user, transactions, open, setTopup, setTab, fmt, Icon, ic }) {
  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="stat-card" style={{ background: "#3b5bdb", border: "none" }}>
          <div className="stat-label" style={{ color: "rgba(255,255,255,0.7)" }}>Available Balance</div>
          <div className="stat-value" style={{ color: "#fff", fontSize: 30 }}>{fmt(user.bankbalance)}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>@{user.username}</div>
        </div>
        <div className="stat-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6 }}
          onClick={() => { setTopup(""); open("topup"); }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.plus} size={18} stroke="#3b5bdb" sw="2.5" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3b5bdb" }}>Add Money</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>via Razorpay</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ cursor: "pointer", padding: 16, display: "flex", alignItems: "center", gap: 14 }}
          onClick={() => open("send")}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#3b5bdb"} onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.send} size={18} stroke="#3b5bdb" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Send Money</div>
            <div style={{ fontSize: 11, color: "#98a2b3" }}>Transfer to any user instantly</div>
          </div>
        </div>
        <div className="card" style={{ cursor: "pointer", padding: 16, display: "flex", alignItems: "center", gap: 14 }}
          onClick={() => open("loan")}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#2f9e44"} onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.loan} size={18} stroke="#2f9e44" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Create Loan</div>
            <div style={{ fontSize: 11, color: "#98a2b3" }}>Lend or borrow from peers</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Recent Transactions</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setTab("HISTORY")}>View All</button>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#98a2b3", fontSize: 13 }}>
            No transactions yet. Add money to get started!
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Details</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {transactions.slice(0, 5).map(t => {
                const out = t.senderName === user.name || t.senderName === user.username;
                return (
                  <tr key={t._id} onClick={() => open("receipt", t)} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: out ? "#fff5f5" : "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={out ? ic.up : ic.down} size={13} stroke={out ? "#e03131" : "#2f9e44"} sw="2.5" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description || t.type}</div>
                          <div style={{ fontSize: 11, color: "#98a2b3" }}>{out ? `To ${t.receiverName}` : `From ${t.senderName}`}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "#98a2b3" }}>{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: out ? "#e03131" : "#2f9e44" }}>
                      {out ? "-" : "+"}{fmt(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
