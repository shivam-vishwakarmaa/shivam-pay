import React from "react";

export default function LoansSection({ loans, user, open, fmt, Icon, ic }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#171717", margin: "0 0 2px", letterSpacing: "-0.3px" }}>Smart EMI Credit & Lending</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: "#667085" }}>Peer-to-peer loan agreements with automatic monthly ledger deductions</p>
        </div>
        <button className="btn btn-primary" style={{ borderRadius: 9999 }} onClick={() => open("loan")}>
          <Icon d={ic.plus} size={16} /> Propose New Loan
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Icon d={ic.loan} size={24} stroke="#171717" />
          </div>
          <h3 style={{ margin: "0 0 6px", color: "#171717", fontWeight: 700, fontSize: 16 }}>No active loan agreements</h3>
          <p style={{ color: "#667085", fontSize: 13.5, margin: "0 0 20px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            Start a credit agreement as either a Lender or Borrower. All EMI settlements are handled automatically by the ShivamPay engine.
          </p>
          <button className="btn btn-primary" style={{ borderRadius: 9999 }} onClick={() => open("loan")}>Propose P2P Loan →</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loans.map(loan => {
            const isLender = loan.lenderName === user.name || loan.lenderName === user.username;
            const pct = Math.min(100, Math.round(((loan.totalPayableAmount - loan.remainingAmount) / loan.totalPayableAmount) * 100));
            const sc = { 
              PENDING: { c: "#ab570a", b: "#fff4e0", l: "⏳ Pending Acceptance" }, 
              ACTIVE: { c: "#0761d1", b: "#d3e5ff", l: "🟢 Active Repayment" }, 
              OVERDUE: { c: "#c50000", b: "#f7d4d6", l: "⚠️ EMI Overdue" }, 
              COMPLETED: { c: "#4d4d4d", b: "#f5f5f5", l: "✓ Fully Paid" }, 
              FORECLOSED: { c: "#4d4d4d", b: "#f5f5f5", l: "✓ Early Settled" } 
            }[loan.status] || { c: "#4d4d4d", b: "#f5f5f5", l: loan.status };

            return (
              <div key={loan._id} className="card" style={{ padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span className="badge" style={{ background: sc.b, color: sc.c, fontWeight: 700 }}>{sc.l}</span>
                      <span style={{ fontSize: 12.5, color: "#667085", fontWeight: 500 }}>
                        {isLender ? `You are Lending to @${loan.borrowerName}` : `You Borrowed from @${loan.lenderName}`}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#171717" }}>{loan.remarks || "P2P Smart Loan Agreement"}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11.5, color: "#888888", fontWeight: 700, textTransform: "uppercase" }}>Total Payable</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#171717" }}>{fmt(loan.totalPayableAmount)}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16, background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 12, padding: "12px 16px" }}>
                  {[["Principal", fmt(loan.principalAmount)], ["Interest Rate", `${loan.interestRate}% APR`], ["Monthly EMI", fmt(loan.emiAmount)], ["Remaining Balance", fmt(loan.remainingAmount)]].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 11, color: "#888888", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#171717", fontFamily: l.includes("Rate") ? "inherit" : "'JetBrains Mono', monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {["ACTIVE","OVERDUE","COMPLETED","FORECLOSED"].includes(loan.status) && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#667085", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>Repayment Progress</span>
                      <span style={{ fontWeight: 700, color: "#171717", fontFamily: "'JetBrains Mono', monospace" }}>{pct}% Repaid</span>
                    </div>
                    <div style={{ height: 6, background: "#ebebeb", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#171717", borderRadius: 9999, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {loan.status === "PENDING" && !isLender && (
                    <button className="btn btn-primary btn-sm" onClick={() => open("accept", loan)}>
                      Accept & Disburse {fmt(loan.principalAmount)} →
                    </button>
                  )}
                  {loan.status === "PENDING" && isLender && (
                    <span className="badge badge-amber">Waiting for @{loan.borrowerName} to accept & sign PIN</span>
                  )}
                  {["ACTIVE","OVERDUE"].includes(loan.status) && !isLender && (
                    <button className="btn btn-sm btn-outline" style={{ borderColor: "#171717", color: "#171717", fontWeight: 600 }} onClick={() => open("foreclose", loan)}>
                      Foreclose & Pay Full ({fmt(loan.remainingAmount)}) — ₹0 Fee
                    </button>
                  )}
                  {["COMPLETED","FORECLOSED"].includes(loan.status) && <span className="badge badge-gray">Closed & Settled</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
