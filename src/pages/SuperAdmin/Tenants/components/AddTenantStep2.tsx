interface Plan {
  key: string;
  name: string;
  desc: string;
  headerBg: string;
  headerColor: string;
  footerBg: string;
  footerColor: string;
}

const PLANS: Plan[] = [
  {
    key: "personal", name: "PERSONAL",
    desc: "lorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor",
    headerBg: "#e8e8e8", headerColor: "#333", footerBg: "#aaa", footerColor: "#fff",
  },
  {
    key: "institute", name: "INSTITUTE",
    desc: "lorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor",
    headerBg: "#FF6B00", headerColor: "#fff", footerBg: "#FF6B00", footerColor: "#fff",
  },
  {
    key: "enterprise", name: "ENTERPRISE",
    desc: "lorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor\nlorem ipsum dolor",
    headerBg: "#b03010", headerColor: "#fff", footerBg: "#b03010", footerColor: "#fff",
  },
];

interface AddTenantStep2Props {
  selectedPlan: string | null;
  onSelect: (planKey: string) => void;
  onBack: () => void;
}

const AddTenantStep2 = ({ selectedPlan, onSelect, onBack }: AddTenantStep2Props) => (
  <div style={s.card}>
    <div style={s.title}>CHOOSE PLAN</div>
    <hr style={s.divider} />
    <div style={s.grid}>
      {PLANS.map((plan) => (
        <div
          key={plan.key}
          onClick={() => onSelect(plan.key)}
          style={{
            ...s.planCard,
            border: selectedPlan === plan.key
              ? "2px solid #FF6B00" : "2px solid transparent",
            transform: selectedPlan === plan.key ? "translateY(-3px)" : "none",
            boxShadow: selectedPlan === plan.key
              ? "0 8px 24px rgba(0,0,0,.12)" : "0 2px 8px rgba(0,0,0,.06)",
          }}
        >
          <div style={{ ...s.planHeader, background: plan.headerBg }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 20, color: plan.headerColor }}>
              {plan.name}
            </div>
          </div>
          <div style={s.planBody}>
            {plan.desc.split("\n").map((line, i) => (
              <div key={i} style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>
                {line}
              </div>
            ))}
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); onSelect(plan.key); }}
            style={{ ...s.planFooter, background: plan.footerBg, color: plan.footerColor }}
          >
            Choose Plan &gt;
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16 }}>
      <button style={s.backBtn} onClick={onBack}>‹</button>
    </div>
  </div>
);

const s: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 10, border: "1px solid #eee",
    padding: 24, margin: "16px 0" },
  title: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 22, color: "#333", marginBottom: 8 },
  divider: { border: "none", borderTop: "1px solid #eee", margin: "12px 0 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 },
  planCard: { borderRadius: 14, overflow: "hidden", cursor: "pointer",
    transition: "transform .2s, box-shadow .2s" },
  planHeader: { padding: "18px 16px 14px" },
  planBody: { padding: "14px 16px", background: "#fff" },
  planFooter: { padding: "12px 16px", textAlign: "center",
    fontWeight: 700, fontSize: 13, cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#FF6B00",
    fontSize: 26, cursor: "pointer", padding: "4px 8px" },
};

export default AddTenantStep2;
