// src/pages/SuperAdmin/Courses/SparkCourses.tsx

import { useState, useMemo } from "react";
import { MOCK_COURSES, MOCK_COMPANIES_COURSES } from "../../../data/mockSACourses";
import type { MockCourse, MockCompanyCourse } from "../../../data/mockSACourses";

import CourseCard from "./components/CourseCard";
import CourseDetail from "./components/CourseDetail";
import PageTransition from "../../../components/common/PageTransition/PageTransition";

type TabKey = "all" | "active" | "pending";

interface TabItem {
  key: TabKey;
  label: string;
}

const SparkCourses = () => {
  const [courses]                = useState<MockCourse[]>(MOCK_COURSES);
  const [view, setView]          = useState<"list" | "detail">("list");
  const [selected, setSelected]  = useState<MockCourse | null>(null);
  const [companyId, setCompanyId]   = useState(0);   // 0 = SPARK (all)
  const [tab, setTab]            = useState<TabKey>("all");
  const [dropdown, setDropdown]  = useState(false);

  // Filter courses
  const filtered = useMemo<MockCourse[]>(() => {
    let r = courses;
    if (companyId !== 0) r = r.filter(c => c.companyId === companyId);
    if (tab === "active")  r = r.filter(c => c.status === "active");
    if (tab === "pending") r = r.filter(c => c.status === "pending");
    return r;
  }, [courses, companyId, tab]);

  const activeCnt  = courses.filter(c => (companyId === 0 || c.companyId === companyId) && c.status === "active").length;
  const pendingCnt = courses.filter(c => (companyId === 0 || c.companyId === companyId) && c.status === "pending").length;

  const selectedCompany: MockCompanyCourse | undefined = MOCK_COMPANIES_COURSES.find(c => c.id === companyId);

  const handleViewDetail = (course: MockCourse) => {
    setSelected(course);
    setView("detail");
  };

  if (view === "detail" && selected) {
    return (
      <PageTransition style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
      <CourseDetail
        course={selected}
        onBack={() => { setView("list"); setSelected(null); }}
      />
      </PageTransition>
    );
  }

  const tabs: TabItem[] = [
    { key: "all",     label: "ALL" },
    { key: "active",  label: `ACTIVE (${activeCnt})` },
    { key: "pending", label: `PENDING (${pendingCnt})` },
  ];

  return (
    <PageTransition style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100%" }}>
    <div style={{
      padding: 24, minHeight: "100%", flex: 1,
      background: "#f4f4f4",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Page title ── */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700, fontSize: 32, color: "#222",
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
              background: "#fff",
              border: "1.5px solid #e0e0e0",
              borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: "#333",
              fontFamily: "'Inter', sans-serif",
              transition: "border-color .2s",
              boxShadow: "0 1px 4px rgba(0,0,0,.05)",
              minWidth: 130,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B00"}
            onMouseLeave={e => { if (!dropdown) (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0"; }}
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
                background: "#fff", border: "1px solid #eee",
                borderRadius: 10, zIndex: 50, minWidth: 220,
                boxShadow: "0 8px 28px rgba(0,0,0,.12)",
                overflow: "hidden",
              }}>
                {MOCK_COMPANIES_COURSES.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setCompanyId(c.id); setDropdown(false); setTab("all"); }}
                    style={{
                      padding: "10px 16px", fontSize: c.id === 0 ? 14 : 12, cursor: "pointer",
                      fontWeight: companyId === c.id ? 700 : 400,
                      color: companyId === c.id ? "#FF6B00" : "#333",
                      background: companyId === c.id ? "#FFF0E6" : "transparent",
                      borderBottom: "1px solid #f5f5f5",
                      transition: "background .15s",
                      textTransform: c.id === 0 ? "none" : "uppercase",
                      letterSpacing: c.id === 0 ? 0 : ".04em",
                    }}
                    onMouseEnter={e => { if (companyId !== c.id) (e.currentTarget as HTMLDivElement).style.background = "#f9f9f9"; }}
                    onMouseLeave={e => { if (companyId !== c.id) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter tabs */}
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "9px 18px",
              background: tab === t.key ? "#FF6B00" : "#fff",
              color: tab === t.key ? "#fff" : "#555",
              border: `1.5px solid ${tab === t.key ? "#FF6B00" : "#ddd"}`,
              borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: ".04em",
              transition: "all .15s",
              boxShadow: tab === t.key
                ? "0 2px 8px rgba(255,107,0,.25)"
                : "0 1px 4px rgba(0,0,0,.05)",
            }}
            onMouseEnter={e => {
              if (tab !== t.key) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B00";
                (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00";
              }
            }}
            onMouseLeave={e => {
              if (tab !== t.key) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#ddd";
                (e.currentTarget as HTMLButtonElement).style.color = "#555";
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
          background: "#fff", borderRadius: 14,
          padding: "48px 24px", textAlign: "center",
          color: "#bbb", fontSize: 14, fontStyle: "italic",
          boxShadow: "0 2px 12px rgba(0,0,0,.07)",
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
