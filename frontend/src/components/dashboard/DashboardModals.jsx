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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#171717", letterSpacing: "-0.3px" }}>Add Money to Wallet</h3>
              <button className="btn btn-ghost btn-sm" onClick={close} style={{ padding: 6, color: "#888888" }}><Icon d={ic.x} size={18} /></button>
            </div>
            {!rzpCfg.isConfigured ? (
              <div>
                <div className="alert alert-info" style={{ marginBottom: 16 }}>Payment gateway keys are currently initializing in environment variables. Please check back shortly.</div>
                <button className="btn btn-outline" style={{ width: "100%", borderRadius: 9999 }} onClick={close}>Close & Return</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="label">Deposit Amount (₹)</label>
                  <input className="input" type="number" min="1" placeholder="Enter amount"
                    autoFocus
                    style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", padding: "12px 16px" }}
                    value={topupAmt} onChange={e => setTopup(e.target.value)} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 10 }}>
                    {[500, 1000, 2000, 5000].map(a => (
                      <button key={a} type="button" className="btn btn-outline btn-sm" style={{ padding: "8px 4px", fontSize: 13, fontWeight: 600, borderRadius: 10 }} onClick={() => setTopup(String(a))}>
                        ₹{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
                <StatusBar />
                <button className="btn btn-primary btn-lg" onClick={handleTopup} disabled={txnState.s === "loading" || !topupAmt} style={{ width: "100%", borderRadius: 9999, marginTop: 4 }}>
                  {txnState.s === "loading" ? "Initializing Gateway..." : `Proceed to Pay ${topupAmt ? fmt(topupAmt) : "₹0"} →`}
                </button>
                <p style={{ fontSize: 11.5, color: "#888888", textAlign: "center", margin: 0 }}>🔒 Encrypted & secured by Razorpay. Zero transaction fees.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan proposal modal */}
      {modal === "loan" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal" style={{ maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#171717", letterSpacing: "-0.3px" }}>Propose P2P Smart Loan</h3>
              <button className="btn btn-ghost btn-sm" onClick={close} style={{ padding: 6, color: "#888888" }}><Icon d={ic.x} size={18} /></button>
            </div>
            <form onSubmit={handleLoan} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 12, padding: 6 }}>
                {["LENDER","BORROWER"].map(r => (
                  <button key={r} type="button" onClick={() => setLoan({ ...loanForm, role: r })}
                    style={{ padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: loanForm.role === r ? "#171717" : "transparent", color: loanForm.role === r ? "#ffffff" : "#667085", transition: "all 0.15s" }}>
                    {r === "LENDER" ? "I am Lending Funds" : "I want to Borrow"}
                  </button>
                ))}
              </div>
              <div>
                <label className="label">Partner's Registered Username</label>
                <input className="input" required placeholder="e.g. alex_kumar" value={loanForm.partnerUsername} onChange={e => setLoan({ ...loanForm, partnerUsername: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label className="label">Principal Amount (₹)</label>
                  <input className="input" type="number" required placeholder="5000" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }} value={loanForm.principalAmount} onChange={e => setLoan({ ...loanForm, principalAmount: e.target.value })} /></div>
                <div><label className="label">Interest Rate (%)</label>
                  <input className="input" type="number" step="0.1" required placeholder="5.0" value={loanForm.interestRate} onChange={e => setLoan({ ...loanForm, interestRate: e.target.value })} /></div>
                <div><label className="label">Duration (Months)</label>
                  <input className="input" type="number" min="1" max="60" required placeholder="6" value={loanForm.durationMonths} onChange={e => setLoan({ ...loanForm, durationMonths: e.target.value })} /></div>
                <div><label className="label">Monthly EMI Date</label>
                  <select className="input" value={loanForm.deductionDayOfMonth} onChange={e => setLoan({ ...loanForm, deductionDayOfMonth: e.target.value })}>
                    {[1,5,10,15,20,25,28].map(d => <option key={d} value={d}>{d}th of every month</option>)}
                  </select></div>
              </div>
              {loanForm.principalAmount && (
                <div style={{ background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 12, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Total Repayment Value", fmt(loanCalc.total)], ["Estimated Monthly EMI", fmt(loanCalc.emi)]].map(([l, v]) => (
                    <div key={l}><div style={{ fontSize: 11.5, color: "#888888", fontWeight: 700, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 16, fontWeight: 800, color: "#171717", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{v}</div></div>
                  ))}
                </div>
              )}
              <div>
                <label className="label">Loan Title or Purpose (optional)</label>
                <input className="input" placeholder="e.g. MacBook Pro acquisition" value={loanForm.remarks} onChange={e => setLoan({ ...loanForm, remarks: e.target.value })} />
              </div>
              <StatusBar />
              <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.s === "loading"} style={{ width: "100%", borderRadius: 9999, marginTop: 4 }}>
                {txnState.s === "loading" ? "Submitting Proposal..." : "Send Credit Agreement →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accept loan */}
      {modal === "accept" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#171717" }}>Accept Loan & Receive Funds</h3>
              <button className="btn btn-ghost btn-sm" onClick={close} style={{ padding: 6, color: "#888888" }}><Icon d={ic.x} size={18} /></button>
            </div>
            <div style={{ padding: "14px 16px", background: "#f8f9fa", border: "1px solid #ebebeb", borderRadius: 12, fontSize: 13.5, color: "#475467", marginBottom: 18, lineHeight: 1.5 }}>
              ⚡ <b>{fmt(modalData.principalAmount)}</b> will be credited directly to your available bank balance. An automated monthly EMI of <b>{fmt(modalData.emiAmount)}</b> will deduct on day {modalData.deductionDayOfMonth} of each month.
            </div>
            <div>
              <label className="label">Enter 4-Digit Security PIN to Authorize</label>
              <input className="input" type="password" maxLength={4} placeholder="••••" autoFocus style={{ width: "100%", maxWidth: 160, textAlign: "center", fontSize: 22, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 10, fontWeight: 700, margin: "0 auto", display: "block" }}
                value={pinInput} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} />
            </div>
            <StatusBar />
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: 9999 }} onClick={close}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ flex: 2, borderRadius: 9999 }} onClick={handleAccept} disabled={txnState.s === "loading" || pinInput.length !== 4}>
                {txnState.s === "loading" ? "Disbursing Funds..." : "Sign PIN & Receive →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foreclose */}
      {modal === "foreclose" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#171717" }}>Settle Loan Early</h3>
              <button className="btn btn-ghost btn-sm" onClick={close} style={{ padding: 6, color: "#888888" }}><Icon d={ic.x} size={18} /></button>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 12, padding: "14px 18px", marginBottom: 18 }}>
              {[["Remaining Balance Due", fmt(modalData.remainingAmount)], ["Early Settle Penalty", "₹0.00 (Waived)"], ["Total Settle Payable", fmt(modalData.remainingAmount)]].map(([l, v], i) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 2 ? "1px solid #ebebeb" : "none", fontWeight: i === 2 ? 800 : 500, color: i === 2 ? "#171717" : "#667085", fontSize: i === 2 ? 15 : 13.5 }}>
                  <span>{l}</span><span style={{ fontFamily: "'JetBrains Mono', monospace", color: i === 1 ? "#2b8a3e" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Enter Security PIN to Settle</label>
              <input className="input" type="password" maxLength={4} placeholder="••••" autoFocus style={{ width: "100%", maxWidth: 160, textAlign: "center", fontSize: 22, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 10, fontWeight: 700, margin: "0 auto", display: "block" }}
                value={pinInput} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} />
            </div>
            <StatusBar />
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1, borderRadius: 9999 }} onClick={close}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ flex: 2, borderRadius: 9999 }} onClick={handleForeclose} disabled={txnState.s === "loading" || pinInput.length !== 4}>
                {txnState.s === "loading" ? "Settling..." : "Confirm — ₹0 Fee →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt */}
      {modal === "receipt" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#171717" }}>Transaction Receipt</h3>
              <button className="btn btn-ghost btn-sm" onClick={close} style={{ padding: 6, color: "#888888" }}><Icon d={ic.x} size={18} /></button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: modalData.status === "SUCCESS" ? "#ebfbee" : "#fff5f5", border: `1px solid ${modalData.status === "SUCCESS" ? "#b2f2bb" : "#ffc9c9"}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <Icon d={modalData.status === "SUCCESS" ? ic.check : ic.x} size={24} stroke={modalData.status === "SUCCESS" ? "#2b8a3e" : "#c50000"} sw="2.5" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#171717" }}>{fmt(modalData.amount)}</div>
              <span className={`badge badge-${modalData.status === "SUCCESS" ? "green" : "red"}`} style={{ marginTop: 6, fontWeight: 700 }}>{modalData.status}</span>
            </div>
            <div style={{ background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
              {[["Reference ID", modalData.referenceId], ["Transaction Type", modalData.type], ["Sender Account", modalData.senderName || "Razorpay Gateway"], ["Receiver Account", modalData.receiverName], ["Date & Time", new Date(modalData.createdAt).toLocaleString("en-IN")], ["Transfer Note", modalData.description || "—"]].map(([l, v], i) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? "1px solid #ebebeb" : "none", fontSize: 13, gap: 12 }}>
                  <span style={{ color: "#888888", fontWeight: 600, flexShrink: 0 }}>{l}</span>
                  <span style={{ color: "#171717", fontWeight: 600, textAlign: "right", wordBreak: "break-all", fontFamily: l.includes("Reference") ? "'JetBrains Mono', monospace" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline" style={{ width: "100%", borderRadius: 9999, fontWeight: 600 }} onClick={close}>
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
