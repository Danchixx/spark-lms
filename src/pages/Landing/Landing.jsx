import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SparkHeader from "../../components/layout/SparkHeader/SparkHeader";
import LeftPanel from "../../components/layout/LeftPanel/LeftPanel";
import CompanyBadge from "../../components/common/CompanyLogo/CompanyBadge";
import Button from "../../components/ui/Button/Button";
import { COMPANIES } from "../../utils/mockData";

const Landing = () => {
  const { selectCompany } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = () => {
    if (!selected) return;
    selectCompany(selected);
    navigate("/login", { state: { company: selected } });
  };

  return (
    <div className="min-h-screen bg-[#e8e8e8] flex flex-col">
      <style>{`
        .landing-body { flex: 1; display: flex; flex-direction: row; align-items: stretch; }
        .landing-left-wrapper { width: 50%; flex-shrink: 0; display: flex; order: 1; }
        .landing-right { flex: 1; display: flex; justify-content: center; align-items: center; padding: 40px; order: 2; min-width: 0; }
        @media (max-width: 1024px) { .landing-left-wrapper { width: 45%; } }
        @media (max-width: 767px) {
          .landing-body { flex-direction: column; }
          .landing-left-wrapper { width: 100%; order: 2; }
          .landing-right { order: 1; padding: 24px 16px; }
        }
      `}</style>

      <SparkHeader />

      <div className="landing-body">
        <div className="landing-left-wrapper">
          <LeftPanel subtitle="Your company's dedicated learning hub — courses, assessments, and certifications tailored to your organization. Select your company to get started." />
        </div>

        <div className="landing-right">
          <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", boxSizing: "border-box" }}>
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.5, color: "#333", marginBottom: 16 }}>
              SELECT YOUR COMPANY
            </div>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999", fontSize: 16 }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your company name or industry ..."
                style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                    border: selected?.id === c.id ? "2px solid #FF6B00" : "1.5px solid #eee",
                    borderRadius: 10, cursor: "pointer",
                    background: selected?.id === c.id ? "#fff8f0" : "white",
                    transition: "all 0.15s", boxSizing: "border-box",
                  }}
                >
                  <CompanyBadge company={c} size={44} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: selected?.id === c.id ? "#FF6B00" : "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.industry} · {c.members} members</div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selected}
              fullWidth
              size="lg"
              style={{ justifyContent: "center" }}
            >
              Select a company to continue →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;