import React from "react";

export default function HistorySection({ transactions, user, open, fmt }) {
  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Transaction History</h3>
          <span className="badge badge-gray">{transactions.length} records</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#98a2b3" }}>No transactions yet.</div>
        ) : (
          <table className="table">
            <thead><tr><th>Details</th><th>Type</th><th>Reference</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {transactions.map(t => {
                const out = t.senderName === user.name || t.senderName === user.username;
                return (
                  <tr key={t._id} onClick={() => open("receipt", t)} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description || t.type}</div>
                      <div style={{ fontSize: 11, color: "#98a2b3" }}>{out ? `To ${t.receiverName}` : `From ${t.senderName}`}</div>
                    </td>
                    <td><span className="badge badge-gray" style={{ fontSize: 10 }}>{t.type}</span></td>
                    <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#98a2b3" }}>{t.referenceId}</td>
                    <td style={{ fontSize: 12, color: "#98a2b3" }}>{new Date(t.createdAt).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: out ? "#e03131" : "#2f9e44" }}>{out ? "-" : "+"}{fmt(t.amount)}</td>
                    <td><span className={`badge badge-${t.status === "SUCCESS" ? "green" : "red"}`}>{t.status}</span></td>
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
