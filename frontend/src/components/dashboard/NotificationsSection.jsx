import React from "react";
import axios from "axios";
import { API } from "../../config/api";

export default function NotificationsSection({ notifications, unreadN, auth, loadAll, Icon, ic }) {
  const markRead = async () => {
    try {
      await axios.put(`${API}/notifications/mark-read`, {}, auth);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#171717", margin: "0 0 2px", letterSpacing: "-0.3px" }}>Security & Ledger Alerts</h3>
          <p style={{ margin: 0, fontSize: 13.5, color: "#667085" }}>Important notifications regarding payments, loan disbursements, and system security</p>
        </div>
        {unreadN > 0 && (
          <button className="btn btn-outline btn-sm" style={{ borderRadius: 9999, fontWeight: 600 }} onClick={markRead}>
            Mark all read ({unreadN}) ✓
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#888888" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon d={ic.bell} size={22} stroke="#171717" />
            </div>
            <h4 style={{ margin: "0 0 4px", fontSize: 15, color: "#171717", fontWeight: 600 }}>No notifications yet</h4>
            <p style={{ margin: 0, fontSize: 13 }}>We will alert you instantly when funds arrive or an EMI falls due.</p>
          </div>
        ) : notifications.map((n, i) => (
          <div key={n._id} style={{ padding: "16px 20px", borderBottom: i < notifications.length - 1 ? "1px solid #ebebeb" : "none", display: "flex", gap: 14, background: !n.isRead ? "#fafafa" : "#ffffff", transition: "background 0.15s" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: !n.isRead ? "#171717" : "#fafafa", border: !n.isRead ? "none" : "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: !n.isRead ? "#ffffff" : "#171717" }}>
              <Icon d={ic.bell} size={16} stroke={!n.isRead ? "#ffffff" : "#171717"} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#171717" }}>
                  {n.title} {!n.isRead && <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#ee0000", marginLeft: 6 }} />}
                </div>
                <div style={{ fontSize: 11.5, color: "#888888", whiteSpace: "nowrap" }}>{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div style={{ fontSize: 13.5, color: "#475467", lineHeight: 1.5 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
