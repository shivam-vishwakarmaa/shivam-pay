import React from "react";

export default function DashboardModals({
  modal, modalData, close, rzpCfg, topupAmt, setTopup,
  handleTopup, handleLoan, handleAccept, handleForeclose,
  loanForm, setLoan, loanCalc, pinInput, setPin,
  txnState, StatusBar, fmt, Icon, ic
}) {
  return (
    <>
      {/* Add Money Modal */}
      {modal === "topup" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Add Money</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            {!rzpCfg.isConfigured ? (
              <div>
                <div className="alert alert-info" style={{ marginBottom: 14 }}>Payment service is currently being set up. Please check back soon.</div>
                <button className="btn btn-outline" style={{ width: "100%" }} onClick={close}>OK</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Amount (₹)</label>
                  <input className="input" type="number" min="1" placeholder="Enter amount"
                    style={{ fontSize: 22, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}
                    value={topupAmt} onChange={e => setTopup(e.target.value)} />
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[500, 1000, 2000, 5000].map(a => <button key={a} className="btn btn-outline btn-sm" onClick={() => setTopup(String(a))}>₹{a.toLocaleString()}</button>)}
                  </div>
                </div>
                <StatusBar />
                <button className="btn btn-primary btn-lg" onClick={handleTopup} disabled={txnState.s === "loading" || !topupAmt} style={{ width: "100%" }}>
                  {txnState.s === "loading" ? "Please wait..." : `Pay ${topupAmt ? fmt(topupAmt) : "₹0"}`}
                </button>
                <p style={{ fontSize: 11, color: "#98a2b3", textAlign: "center", margin: 0 }}>Secured by Razorpay. We never store your card or bank details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan proposal modal */}
      {modal === "loan" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal" style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>New Loan</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <form onSubmit={handleLoan} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#f2f4f7", borderRadius: 8, padding: 3 }}>
                {["LENDER","BORROWER"].map(r => (
                  <button key={r} type="button" onClick={() => setLoan({ ...loanForm, role: r })}
                    style={{ padding: 7, borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: loanForm.role === r ? "#fff" : "transparent", color: loanForm.role === r ? "#3b5bdb" : "#667085", boxShadow: loanForm.role === r ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
                    {r === "LENDER" ? "I'm Lending" : "I'm Borrowing"}
                  </button>
                ))}
              </div>
              <div>
                <label className="label">Partner's Username</label>
                <input className="input" required placeholder="Username" value={loanForm.partnerUsername} onChange={e => setLoan({ ...loanForm, partnerUsername: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Amount (₹)</label>
                  <input className="input" type="number" required value={loanForm.principalAmount} onChange={e => setLoan({ ...loanForm, principalAmount: e.target.value })} /></div>
                <div><label className="label">Interest (%)</label>
                  <input className="input" type="number" step="0.1" required value={loanForm.interestRate} onChange={e => setLoan({ ...loanForm, interestRate: e.target.value })} /></div>
                <div><label className="label">Duration (Months)</label>
                  <input className="input" type="number" min="1" max="60" required value={loanForm.durationMonths} onChange={e => setLoan({ ...loanForm, durationMonths: e.target.value })} /></div>
                <div><label className="label">EMI Day</label>
                  <select className="input" value={loanForm.deductionDayOfMonth} onChange={e => setLoan({ ...loanForm, deductionDayOfMonth: e.target.value })}>
                    {[1,5,10,15,20,25,28].map(d => <option key={d} value={d}>{d}th of month</option>)}
                  </select></div>
              </div>
              {loanForm.principalAmount && (
                <div style={{ background: "#eff4ff", borderRadius: 8, padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Total Payable", fmt(loanCalc.total)], ["Monthly EMI", fmt(loanCalc.emi)]].map(([l, v]) => (
                    <div key={l}><div style={{ fontSize: 11, color: "#3b5bdb", fontWeight: 600 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 800, color: "#364fc7" }}>{v}</div></div>
                  ))}
                </div>
              )}
              <div>
                <label className="label">Title (optional)</label>
                <input className="input" placeholder="e.g. Laptop purchase" value={loanForm.remarks} onChange={e => setLoan({ ...loanForm, remarks: e.target.value })} />
              </div>
              <StatusBar />
              <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.s === "loading"} style={{ width: "100%" }}>
                {txnState.s === "loading" ? "Submitting..." : "Submit Proposal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accept loan */}
      {modal === "accept" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Accept Loan</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              {fmt(modalData.principalAmount)} will be credited to your account. Monthly EMI of {fmt(modalData.emiAmount)} will auto-deduct on day {modalData.deductionDayOfMonth}.
            </div>
            <div>
              <label className="label">Enter Security PIN</label>
              <input className="input" type="password" maxLength={4} placeholder="••••" style={{ maxWidth: 120, textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                value={pinInput} onChange={e => setPin(e.target.value)} />
            </div>
            <StatusBar />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={close}>Cancel</button>
              <button className="btn btn-green" style={{ flex: 2 }} onClick={handleAccept} disabled={txnState.s === "loading"}>
                {txnState.s === "loading" ? "Processing..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foreclose */}
      {modal === "foreclose" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Settle Loan Early</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              {[["Remaining", fmt(modalData.remainingAmount)], ["Closure Fee", "₹0.00"], ["You Pay", fmt(modalData.remainingAmount)]].map(([l, v], i) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid #eaecf0" : "none", fontWeight: i === 2 ? 800 : 500, color: i === 2 ? "#1a1a2e" : "#667085", fontSize: i === 2 ? 14 : 13 }}>
                  <span>{l}</span><span style={{ fontFamily: "JetBrains Mono, monospace", color: i === 1 ? "#2f9e44" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Security PIN</label>
              <input className="input" type="password" maxLength={4} placeholder="••••" style={{ maxWidth: 120, textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                value={pinInput} onChange={e => setPin(e.target.value)} />
            </div>
            <StatusBar />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={close}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleForeclose} disabled={txnState.s === "loading"}>
                {txnState.s === "loading" ? "Settling..." : "Confirm — ₹0 Fee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt */}
      {modal === "receipt" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Receipt</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <Icon d={ic.check} size={22} stroke="#2f9e44" sw="2.5" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "JetBrains Mono, monospace" }}>{fmt(modalData.amount)}</div>
              <span className={`badge badge-${modalData.status === "SUCCESS" ? "green" : "red"}`} style={{ marginTop: 6 }}>{modalData.status}</span>
            </div>
            <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 14px" }}>
              {[["Reference", modalData.referenceId], ["Type", modalData.type], ["From", modalData.senderName || "Razorpay"], ["To", modalData.receiverName], ["Date", new Date(modalData.createdAt).toLocaleString("en-IN")], ["Note", modalData.description || "—"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eaecf0", fontSize: 13, gap: 10 }}>
                  <span style={{ color: "#98a2b3", fontWeight: 600, flexShrink: 0 }}>{l}</span>
                  <span style={{ color: "#1a1a2e", fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
