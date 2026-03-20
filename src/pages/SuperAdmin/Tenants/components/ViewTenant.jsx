import { useState } from "react";

// ── Subscription history modal ────────────────────────────────
const SubscriptionHistoryModal = ({ tenant, onClose }) => {
  const history = [
    { plan: "Personal",   started: "Jan 01 2024", ended: "Jan 01 2025", status: "Expired" },
    { plan: "Institute",  started: "Jan 02 2025", ended: "Jan 02 2026", status: "Expired" },
    { plan: tenant.plan,  started: tenant.joined,  ended: tenant.end,    status: "Active"  },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 14, padding: 28, width: 520,
        maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 20, color: "#222" }}>
              Subscription History
            </div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
              {tenant.name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none",
            fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>
            ×
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Plan", "Date Started", "Date Ended", "Status"].map((h) => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "#aaa",
                  letterSpacing: ".1em", textTransform: "uppercase",
                  padding: "8px 12px", textAlign: "left",
                  background: "#f7f7f7", borderBottom: "1px solid #eee" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i}>
                <td style={mStyle.td}>
                  <span style={{ color: "#FF6B00", fontWeight: 700 }}>{row.plan}</span>
                </td>
                <td style={mStyle.td}>{row.started}</td>
                <td style={mStyle.td}>{row.ended}</td>
                <td style={mStyle.td}>
                  <span style={{
                    background: row.status === "Active" ? "#d5f5e0" : "#f5f5f5",
                    color: row.status === "Active" ? "#1e8449" : "#888",
                    fontSize: 11, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 20, display: "inline-block",
                  }}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button onClick={onClose} style={{ background: "#FF6B00", color: "#fff",
            border: "none", borderRadius: 8, padding: "8px 20px",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            fontFamily: "'Barlow', sans-serif" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const mStyle = {
  td: { padding: "11px 12px", borderBottom: "1px solid #f2f2f2",
    fontSize: 13, color: "#555", verticalAlign: "middle" },
};

// ── Subscription card ─────────────────────────────────────────
const SubscriptionCard = ({ plan, joined, end }) => (
  <div style={{
    background: "linear-gradient(135deg, #FF8C00, #c0392b)",
    borderRadius: 16, padding: 14,
  }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 0 }}>
      <div style={{
        background: "#FF6B00", borderRadius: "10px 10px 0 0",
        padding: "7px 22px",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 16, color: "#fff",
        letterSpacing: ".12em", textTransform: "uppercase",
        marginRight: 10, position: "relative", zIndex: 2,
      }}>
        {plan.toUpperCase()}
      </div>
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 20, color: "#222",
        letterSpacing: ".08em", paddingBottom: 6 }}>
        SUBSCRIPTION
      </span>
    </div>

    {/* Inner white box */}
    <div style={{ background: "#fff", borderRadius: "0 12px 12px 12px",
      padding: "16px 20px", display: "flex", alignItems: "center", gap: 20 }}>
      {/* Storage circle */}
      <div style={{ display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%",
          border: "8px solid #c0392b", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#c0392b",
            textAlign: "center", lineHeight: 1.4 }}>
            storage<br />full
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#888", cursor: "pointer",
          textDecoration: "underline" }}>
          view usage
        </span>
      </div>
      {/* Duration */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#222", marginBottom: 12 }}>
          Subscription Duration
        </div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div style={{ height: 14, background: "#e0e0e0", borderRadius: 7, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "50%", borderRadius: 7,
              background: "linear-gradient(90deg, #7B3F00, #FF6B00)" }} />
          </div>
          <div style={{ position: "absolute", top: "50%", left: "25%",
            transform: "translate(-50%, -50%)" }}>
            <span style={{ background: "#FF6B00", color: "#fff", fontSize: 10,
              fontWeight: 700, padding: "2px 10px", borderRadius: 10, whiteSpace: "nowrap" }}>
              182 days
            </span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#888" }}>
          <span>Date Started &nbsp; {joined}</span>
          <span>Date End &nbsp; {end}</span>
        </div>
      </div>
    </div>
  </div>
);

// ── Main ViewTenant ───────────────────────────────────────────
const ViewTenant = ({ tenant, onBack }) => {
  const [showSubHistory, setShowSubHistory] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={s.bcBtn}>← Tenant List</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>Tenant Profile</span>
      </div>

      <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
        <div style={s.card}>
          {/* Cover */}
          <div style={s.cover}>
            <span style={{ fontSize: 64, opacity: 0.15 }}>🏛️</span>
          </div>

          <div style={{ padding: "0 20px 24px" }}>
            {/* Logo + Name */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14,
              marginTop: -40, marginBottom: 16 }}>
              <div style={s.logoWrap}>
                <span style={{ fontSize: 13, fontWeight: 900, color: tenant.color,
                  textAlign: "center", letterSpacing: 1 }}>
                  {tenant.abbr.slice(0, 5)}
                </span>
              </div>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: 24, color: "#222" }}>
                {tenant.name}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Left: About */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#333", marginBottom: 10 }}>
                  About this tenant
                </div>
                <p style={s.about}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus eget
                  sapien bibendum varius. Curabitur vehicula, nisl a fermentum aliquet, nunc
                  urna tincidunt nisi, nec faucibus lorem mauris ut nisl. Integer euismod,
                  magna at convallis cursus, purus erat lacinia urna, vitae luctus metus odio.
                </p>
                <p style={{ ...s.about, marginBottom: 16 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 8 }}>
                  Contact
                </div>
                <div style={s.contactRow}>📧 {tenant.email}</div>
                <div style={s.contactRow}>📞 {tenant.phone}</div>
              </div>

              {/* Right: Stats + Subscription */}
              <div>
                {/* Stat mini cards — Total Subscriptions replaces Total Revenue */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                  gap: 8, marginBottom: 16 }}>
                  {[
                    { icon: "💳", label: "Total Subscriptions", val: tenant.stats.subscriptions ?? 3, clickable: true },
                    { icon: "👥", label: "Total Management",    val: tenant.stats.management },
                    { icon: "🎓", label: "Total Learners",      val: tenant.stats.learners },
                    { icon: "📚", label: "Total Courses",       val: tenant.stats.courses },
                  ].map((st) => (
                    <div
                      key={st.label}
                      onClick={st.clickable ? () => setShowSubHistory(true) : undefined}
                      style={{
                        ...s.statMini,
                        cursor: st.clickable ? "pointer" : "default",
                        border: st.clickable ? "1px solid #FF6B00" : "1px solid #eee",
                        transition: "box-shadow .15s",
                      }}
                      title={st.clickable ? "Click to view subscription history" : ""}
                    >
                      <div style={{ fontSize: 20 }}>{st.icon}</div>
                      <div style={{ fontSize: 9, color: st.clickable ? "#FF6B00" : "#aaa",
                        textTransform: "uppercase", letterSpacing: ".08em",
                        textAlign: "center", fontWeight: st.clickable ? 700 : 400 }}>
                        {st.label}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#333" }}>
                        {st.val}
                      </div>
                      {st.clickable && (
                        <div style={{ fontSize: 9, color: "#FF6B00" }}>view history →</div>
                      )}
                    </div>
                  ))}
                </div>

                <SubscriptionCard
                  plan={tenant.plan}
                  joined={tenant.joined}
                  end={tenant.end}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubHistory && (
        <SubscriptionHistoryModal
          tenant={tenant}
          onClose={() => setShowSubHistory(false)}
        />
      )}
    </div>
  );
};

const s = {
  bcBtn: { display: "flex", alignItems: "center", gap: 6, background: "#FFF0E6",
    border: "1.5px solid #FF6B00", borderRadius: 20, padding: "6px 14px",
    cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#FF6B00",
    fontFamily: "'Barlow', sans-serif" },
  card: { background: "#fff", borderRadius: 10, border: "1px solid #eee", overflow: "hidden" },
  cover: { width: "100%", height: 130,
    background: "linear-gradient(135deg, #c8d4e8, #8fa8c8)",
    display: "flex", alignItems: "center", justifyContent: "center" },
  logoWrap: { width: 80, height: 80, borderRadius: "50%", background: "#fff",
    border: "3px solid #ddd", display: "flex", alignItems: "center",
    justifyContent: "center", position: "relative", zIndex: 2, flexShrink: 0 },
  about: { fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 12 },
  contactRow: { fontSize: 13, color: "#888", display: "flex",
    alignItems: "center", gap: 6, marginBottom: 4 },
  statMini: { background: "#fff", border: "1px solid #eee", borderRadius: 8,
    padding: "10px 6px", display: "flex", flexDirection: "column",
    alignItems: "center", gap: 3 },
};

export default ViewTenant;
