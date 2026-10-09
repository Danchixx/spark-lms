// src/pages/SuperAdmin/Courses/SparkCourses.jsx

import { useState, useMemo } from "react";
import { MOCK_COURSES, MOCK_COMPANIES_COURSES } from "../../../data/mockCourses";
import CourseCard from "./components/CourseCard";
import CourseDetail from "./components/CourseDetail";
import PageTransition from "../../../components/common/PageTransition";

// ── SUPABASE INTEGRATION (uncomment when ready):
// import { fetchCourses } from '../../../data/mockCourses';
// useEffect(() => { fetchCourses().then(setCourses); }, []);

const SparkCourses = () => {
  const [courses]         = useState(MOCK_COURSES);
  const [view, setView]   = useState("list");   // "list" | "detail"
  const [selected, setSelected] = useState(null);
  const [companyId, setCompanyId]   = useState(0);    // 0 = SPARK
  const [tab, setTab]     = useState("all");    // "all" | "active" | "pending"
  const [dropdown, setDropdown] = useState(false);

  // Filter courses
  const filtered = useMemo(() => {
    let r = courses;
    if (companyId !== 0) r = r.filter(c => c.companyId === companyId);
    if (tab === "active")  r = r.filter(c => c.status === "active");
    if (tab === "pending") r = r.filter(c => c.status === "pending");
    return r;
  }, [courses, companyId, tab]);

  const activeCnt  = courses.filter(c => (companyId === 0 || c.companyId === companyId) && c.status === "active").length;
  const pendingCnt = courses.filter(c => (companyId === 0 || c.companyId === companyId) && c.status === "pending").length;

  const selectedCompany = MOCK_COMPANIES_COURSES.find(c => c.id === companyId);

  const handleViewDetail = (course) => {
    setSelected(course);
    setView("detail");
  };

  if (view === "detail" && selected) {
    return (
      <PageTransition>
        <CourseDetail
          course={selected}
          onBack={() => { setView("list"); setSelected(null); }}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{
      padding: 24, minHeight: "100%",
      background: "var(--bg, #f4f4f4)",
      fontFamily: "'Barlow', sans-serif",
      color: "var(--text, #222)",
    }}>

      {/* ── Page title ── */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 28, color: "var(--text, #222)",
        textTransform: "uppercase", letterSpacing: ".05em",
        marginBottom: 20,
      }}>
        Courses
      </div>

      {/* ── Filters row ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginBottom: 24, flexWrap: "wrap",
      }}>

        {/* Company dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdown(!dropdown)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 16px",
              background: "var(--card, #fff)",
              border: "1.5px solid var(--line, #e0e0e0)",
              borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: "var(--text, #333)",
              fontFamily: "'Barlow', sans-serif",
              transition: "border-color .2s",
              boxShadow: "var(--shadow, 0 1px 4px rgba(0,0,0,.05))",
              minWidth: 130,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent, #FF6B00)"}
            onMouseLeave={e => { if (!dropdown) e.currentTarget.style.borderColor = "var(--line, #e0e0e0)"; }}
          >
            <span>{selectedCompany?.name || "SPARK"}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points={dropdown ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
            </svg>
          </button>

          {dropdown && (
            <>
              {/* Backdrop */}
              <div onClick={() => setDropdown(false)} style={{
                position: "fixed", inset: 0, zIndex: 40,
              }} />
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0,
                background: "var(--card, #fff)", border: "1px solid var(--line, #eee)",
                borderRadius: 10, zIndex: 50, minWidth: 220,
                boxShadow: "var(--shadow, 0 8px 28px rgba(0,0,0,.12))",
                overflow: "hidden",
              }}>
                {MOCK_COMPANIES_COURSES.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setCompanyId(c.id); setDropdown(false); setTab("all"); }}
                    style={{
                      padding: "10px 16px", fontSize: 13, cursor: "pointer",
                      fontWeight: companyId === c.id ? 700 : 400,
                      color: companyId === c.id ? "var(--accent-text, #FF6B00)" : "var(--text, #333)",
                      background: companyId === c.id ? "var(--accent-soft, #FFF0E6)" : "transparent",
                      borderBottom: "1px solid var(--line, #f5f5f5)",
                      transition: "background .15s",
                      textTransform: c.id === 0 ? "none" : "uppercase",
                      letterSpacing: c.id === 0 ? 0 : ".04em",
                      fontSize: c.id === 0 ? 14 : 12,
                    }}
                    onMouseEnter={e => { if (companyId !== c.id) e.currentTarget.style.background = "var(--card-2, #f9f9f9)"; }}
                    onMouseLeave={e => { if (companyId !== c.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter tabs */}
        {[
          { key: "all",     label: "ALL" },
          { key: "active",  label: `ACTIVE (${activeCnt})` },
          { key: "pending", label: `PENDING (${pendingCnt})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "9px 18px",
              background: tab === t.key ? "var(--accent, #FF6B00)" : "var(--card, #fff)",
              color: tab === t.key ? "#fff" : "var(--muted, #555)",
              border: `1.5px solid ${tab === t.key ? "var(--accent, #FF6B00)" : "var(--line, #ddd)"}`,
              borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Barlow', sans-serif",
              letterSpacing: ".04em",
              transition: "all .15s",
              boxShadow: tab === t.key
                ? "0 2px 8px rgba(255,107,0,.25)"
                : "var(--shadow, 0 1px 4px rgba(0,0,0,.05))",
            }}
            onMouseEnter={e => {
              if (tab !== t.key) {
                e.currentTarget.style.borderColor = "var(--accent, #FF6B00)";
                e.currentTarget.style.color = "var(--accent-text, #FF6B00)";
              }
            }}
            onMouseLeave={e => {
              if (tab !== t.key) {
                e.currentTarget.style.borderColor = "var(--line, #ddd)";
                e.currentTarget.style.color = "var(--muted, #555)";
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Course grid ── */}
      {filtered.length === 0 ? (
        <div style={{
          background: "var(--card, #fff)", borderRadius: 14,
          border: "1px solid var(--line, #eee)",
          padding: "48px 24px", textAlign: "center",
          color: "var(--muted, #bbb)", fontSize: 14, fontStyle: "italic",
          boxShadow: "var(--shadow, 0 2px 12px rgba(0,0,0,.07))",
        }}>
          No courses found.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={handleViewDetail}
            />
          ))}
        </div>
      )}
      </div>
    </PageTransition>
  );
};

export default SparkCourses;
