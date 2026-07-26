import React from "react";

export default function LoansSection({ loans, user, open, fmt, Icon, ic }) {
  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#667085" }}>Lend or borrow with automated monthly EMI deductions</p>
        <button className="btn btn-primary btn-sm" onClick={() => open("loan")}><Icon d={ic.plus} size={14} /> New Loan</button>
      </div>

      {loans.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <Icon d={ic.loan} size={36} stroke="#d0d5dd" />
          <h3 style={{ marginTop: 10, color: "#667085", fontWeight: 600 }}>No loan agreements yet</h3>
          <p style={{ color: "#98a2b3", fontSize: 13 }}>Create a P2P loan with another user.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => open("loan")}>Create Loan</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {loans.map(loan => {
            const isLender = loan.lenderName === user.name || loan.lenderName === user.username;
            const pct = Math.min(100, Math.round(((loan.totalPayableAmount - loan.remainingAmount) / loan.totalPayableAmount) * 100));
            const sc = { PENDING: { c: "#e67700", b: "#fff9db", l: "Pending" }, ACTIVE: { c: "#2b8a3e", b: "#ebfbee", l: "Active" }, OVERDUE: { c: "#c92a2a", b: "#fff5f5", l: "Overdue" }, COMPLETED: { c: "#495057", b: "#f1f3f5", l: "Completed" }, FORECLOSED: { c: "#495057", b: "#f1f3f5", l: "Settled" } }[loan.status] || { c: "#495057", b: "#f1f3f5", l: loan.status };

            return (
              <div key={loan._id} className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="badge" style={{ background: sc.b, color: sc.c }}>{sc.l}</span>
                      <span style={{ fontSize: 12, color: "#98a2b3" }}>{isLender ? `Lending to @${loan.borrowerName}` : `Borrowed from @${loan.lenderName}`}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{loan.remarks || "Loan Agreement"}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#98a2b3" }}>Total Payable</div>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>{fmt(loan.totalPayableAmount)}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14, background: "#f8f9fb", borderRadius: 10, padding: "10px 14px" }}>
                  {[["Principal", fmt(loan.principalAmount)], ["Interest", `${loan.interestRate}%`], ["EMI/Month", fmt(loan.emiAmount)], ["Remaining", fmt(loan.remainingAmount)]].map(([l, v]) => (
                    <div key={l}><div style={{ fontSize: 11, color: "#98a2b3", fontWeight: 600, marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div></div>
                  ))}
                </div>

                {["ACTIVE","OVERDUE","COMPLETED","FORECLOSED"].includes(loan.status) && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#98a2b3", marginBottom: 5 }}>
                      <span>Repayment Progress</span><span style={{ fontWeight: 700, color: "#2f9e44" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#eaecf0", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#3b5bdb", borderRadius: 5, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {loan.status === "PENDING" && <button className="btn btn-green btn-sm" onClick={() => open("accept", loan)}>Accept & Receive {fmt(loan.principalAmount)}</button>}
                  {["ACTIVE","OVERDUE"].includes(loan.status) && !isLender && (
                    <button className="btn btn-sm btn-outline" style={{ color: "#3b5bdb", borderColor: "#bac8ff" }} onClick={() => open("foreclose", loan)}>Pay Full — ₹0 Fee</button>
                  )}
                  {["COMPLETED","FORECLOSED"].includes(loan.status) && <span className="badge badge-green">Settled</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
