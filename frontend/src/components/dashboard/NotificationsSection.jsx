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
    <div style={{ maxWidth: 650, margin: "0 auto" }}>
      {unreadN > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={markRead}>Mark all read</button>
        </div>
      )}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "50px 20px", textAlign: "center", color: "#98a2b3" }}>
            <Icon d={ic.bell} size={30} stroke="#d0d5dd" />
            <p style={{ marginTop: 10 }}>No notifications yet.</p>
          </div>
        ) : notifications.map((n, i) => (
          <div key={n._id} style={{ padding: "14px 18px", borderBottom: i < notifications.length - 1 ? "1px solid #f2f4f7" : "none", display: "flex", gap: 12, background: !n.isRead ? "#fafbff" : "#fff" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={ic.bell} size={14} stroke="#3b5bdb" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "#98a2b3", whiteSpace: "nowrap" }}>{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
              </div>
              <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.5 }}>{n.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
