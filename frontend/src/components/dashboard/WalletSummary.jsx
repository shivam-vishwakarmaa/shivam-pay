import React from "react";

export default function WalletSummary({ user, transactions, open, setTopup, setTab, fmt, Icon, ic }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Balance & Add Money Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ background: "#171717", borderColor: "#171717", color: "#fff" }}>
          <div className="stat-label" style={{ color: "#a1a1aa", fontSize: 11 }}>Available Ledger Balance</div>
          <div className="stat-value" style={{ color: "#ffffff", fontSize: 32, margin: "6px 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>
            {fmt(user.bankbalance)}
          </div>
          <div style={{ fontSize: 12.5, color: "#888888", display: "flex", alignItems: "center", gap: 6 }}>
            <span>@{user.username}</span> • <span style={{ color: "#50e3c2", fontWeight: 600 }}>● Active & Secure</span>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, background: "#ffffff", border: "1px dashed #cccccc", transition: "all 0.15s" }}
          onClick={() => { setTopup(""); open("topup"); }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#171717"; e.currentTarget.style.background = "#fafafa"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#cccccc"; e.currentTarget.style.background = "#ffffff"; }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={ic.plus} size={20} stroke="#171717" sw="2.5" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>Add Money to Wallet</div>
          <div style={{ fontSize: 11.5, color: "#667085" }}>Instant Top-up via Razorpay Gateway</div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ cursor: "pointer", padding: 18, display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
          onClick={() => open("send")}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#171717"} onMouseLeave={e => e.currentTarget.style.borderColor = "#ebebeb"}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon d={ic.send} size={20} stroke="#171717" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>Send Money</div>
            <div style={{ fontSize: 12, color: "#667085" }}>Transfer directly to any peer instantly</div>
          </div>
        </div>

        <div className="card" style={{ cursor: "pointer", padding: 18, display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
          onClick={() => open("loan")}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#171717"} onMouseLeave={e => e.currentTarget.style.borderColor = "#ebebeb"}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon d={ic.loan} size={20} stroke="#171717" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>Smart EMI Credit</div>
            <div style={{ fontSize: 12, color: "#667085" }}>Lend or borrow with automatic monthly deductions</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#171717" }}>Recent Ledger Activity</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#667085" }}>Real-time money transfers and loan disbursements</p>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ border: "1px solid #ebebeb", borderRadius: 9999, fontSize: 12 }} onClick={() => setTab("HISTORY")}>View All →</button>
        </div>

        <div className="table-container">
          {transactions.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#888888", fontSize: 13.5 }}>
              No transactions yet. Top up your account or receive money to begin!
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction Details</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map(t => {
                  const out = t.senderName === user.name || t.senderName === user.username;
                  return (
                    <tr key={t._id} onClick={() => open("receipt", t)} style={{ cursor: "pointer" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: out ? "#fff5f5" : "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon d={out ? ic.up : ic.down} size={15} stroke={out ? "#c50000" : "#2b8a3e"} sw="2.5" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#171717" }}>{t.description || t.type}</div>
                            <div style={{ fontSize: 11.5, color: "#667085" }}>{out ? `Transferred to @${t.receiverName}` : `Received from @${t.senderName || "Razorpay"}`}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: "#667085" }}>{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: out ? "#c50000" : "#2b8a3e" }}>
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
    </div>
  );
}
