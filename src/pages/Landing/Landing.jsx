import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import SparkHeader from "../../components/layout/SparkHeader/SparkHeader";
import LeftPanel from "../../components/layout/LeftPanel/LeftPanel";
import PageTransition from "../../components/common/PageTransition";
import { Building2, Search, Loader2 } from "lucide-react";
import CompanyBadge from "../../components/common/CompanyLogo/CompanyBadge";
import Button from "../../components/ui/Button/Button";

const Landing = () => {
  const { user, company: authCompany, selectCompany } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-redirect if already logged in!
  useEffect(() => {
    if (user && authCompany) {
      const slug = authCompany.name.toLowerCase().replace(/\s+/g, "-");
      navigate(`/${slug}/dashboard`, { replace: true });
    }
  }, [user, authCompany, navigate]);

  // Fetch companies from Supabase
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('is_archived', false);
        
        if (data) setCompanies(data);
        if (error) console.error("Error fetching companies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  );

  const handleContinue = () => {
    if (!selected) return;
    // Set transient state so Login page knows which company they picked
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
          <PageTransition style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", boxSizing: "border-box" }}>
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1.5, color: "#333", marginBottom: 16 }}>
              SELECT YOUR COMPANY
            </div>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your company name or industry ..."
                style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ minHeight: 120, maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {isLoading ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, py: 20 }}>
                  <Loader2 className="animate-spin" size={32} color="#FF6B00" />
                  <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>Finding companies...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 0" }}>
                  <Building2 size={32} color="#ddd" />
                  <span style={{ fontSize: 13, color: "#999", fontWeight: 500 }}>No companies found</span>
                </div>
              ) : (
                filtered.map((c) => (
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
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.industry} · {c.members || 0} members</div>
                    </div>
                  </div>
                ))
              )}
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
        </PageTransition>
      </div>
      </div>
    </div>
  );
};

export default Landing;