import React from "react";

export default function HistorySection({ transactions, user, open, fmt }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#171717", margin: "0 0 2px", letterSpacing: "-0.3px" }}>Complete Transaction History</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: "#667085" }}>Audit log of all deposits, peer transfers, and loan EMI settlements</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ebebeb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>All Ledger Records</span>
          <span className="badge badge-gray">{transactions.length} total entries</span>
        </div>

        <div className="table-container">
          {transactions.length === 0 ? (
            <div style={{ padding: "50px 20px", textAlign: "center", color: "#888888", fontSize: 13.5 }}>
              No transactions recorded yet in your digital ledger.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction Details</th>
                  <th>Type</th>
                  <th>Reference ID</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const out = t.senderName === user.name || t.senderName === user.username;
                  return (
                    <tr key={t._id} onClick={() => open("receipt", t)} style={{ cursor: "pointer" }}>
                      <td>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#171717" }}>{t.description || t.type}</div>
                        <div style={{ fontSize: 11.5, color: "#667085" }}>{out ? `To @${t.receiverName}` : `From @${t.senderName || "Razorpay"}`}</div>
                      </td>
                      <td><span className="badge badge-gray" style={{ fontSize: 11, fontWeight: 600 }}>{t.type}</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#667085" }}>{t.referenceId}</td>
                      <td style={{ fontSize: 12.5, color: "#667085", whiteSpace: "nowrap" }}>{new Date(t.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                      <td style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: out ? "#c50000" : "#2b8a3e" }}>
                        {out ? "-" : "+"}{fmt(t.amount)}
                      </td>
                      <td><span className={`badge badge-${t.status === "SUCCESS" ? "green" : "red"}`}>{t.status}</span></td>
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
