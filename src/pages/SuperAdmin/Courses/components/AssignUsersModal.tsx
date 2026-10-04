// src/pages/SuperAdmin/Courses/components/AssignUsersModal.tsx

import { useState, useMemo, useEffect } from "react";
import { MOCK_ALL_ASSIGNABLE_USERS, MOCK_COMPANIES_COURSES } from "../../../../data/mockSACourses";
import type { MockCourse, AssignableUser } from "../../../../data/mockSACourses";


// ── Props ──────────────────────────────────────────────────────
interface AssignUsersModalProps {
  course: MockCourse;
  enrolledUserIds?: number[];
  onClose: () => void;
  onAssigned: (ids: number[]) => void;
}

// ── AssignUsersModal ──────────────────────────────────────────
const AssignUsersModal = ({
  course,
  enrolledUserIds = [],
  onClose,
  onAssigned,
}: AssignUsersModalProps) => {
  const [search, setSearch]         = useState("");
  const [companyId, setCompanyId]   = useState("");
  const [selected, setSelected]     = useState<number[]>([]);
  const [dropdownOpen, setDropdown] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Filter users — exclude already enrolled
  const filtered = useMemo<AssignableUser[]>(() => {
    let users = MOCK_ALL_ASSIGNABLE_USERS.filter(u => !enrolledUserIds.includes(u.id));
    if (companyId) users = users.filter(u => u.companyId === Number(companyId));
    if (search.trim()) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return users;
  }, [search, companyId, enrolledUserIds]);

  const toggleUser = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(u => u.id));

  const selectedCompany = MOCK_COMPANIES_COURSES.find(c => c.id === Number(companyId));

  const handleAssign = () => {
    onAssigned(selected);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16,
        width: "min(660px, 96vw)", maxHeight: "88vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 80px rgba(0,0,0,.25)",
        overflow: "hidden",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: "#222",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: ".02em",
            }}>
              Assign Users to Course
            </div>
            <div style={{ fontSize: 13, color: "#FF6B00", fontWeight: 600, marginTop: 2 }}>
              {course.title}
            </div>
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center",
            border: "1.5px solid #e0e0e0", borderRadius: 24,
            padding: "7px 14px", gap: 8, background: "#fafafa",
            width: 260, transition: "border-color .2s",
          }}
            onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#FF6B00"}
            onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#e0e0e0"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search users by name, email, or dept."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: "none", outline: "none", flex: 1,
                fontSize: 12, fontFamily: "'Inter', sans-serif",
                color: "#333", background: "transparent",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "none", border: "none",
                cursor: "pointer", color: "#bbb", fontSize: 16, lineHeight: 1,
              }}>×</button>
            )}
          </div>

          {/* Close */}
          <button onClick={onClose} style={{
            background: "#f5f5f5", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#666", marginLeft: 12, flexShrink: 0,
            transition: "background .15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#ffe8d6"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5"}
          >
            ×
          </button>
        </div>

        {/* ── Company dropdown ── */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888",
            textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Company
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdown(!dropdownOpen)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", maxWidth: 300,
                padding: "10px 14px",
                background: companyId ? "#FFF0E6" : "#f5f5f5",
                border: `1.5px solid ${companyId ? "#FF6B00" : "#ddd"}`,
                borderRadius: 8, cursor: "pointer",
                fontSize: 13, fontWeight: companyId ? 700 : 400,
                color: companyId ? "#FF6B00" : "#888",
                fontFamily: "'Inter', sans-serif",
                transition: "all .15s",
              }}
            >
              <span>
                {selectedCompany ? selectedCompany.name.toUpperCase() : "select company"}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points={dropdownOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
              </svg>
            </button>

            {/* Dropdown list */}
            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0,
                width: "100%", maxWidth: 300,
                background: "#fff", border: "1px solid #eee",
                borderRadius: 10, zIndex: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,.1)",
                overflow: "hidden",
              }}>
                {/* Clear option */}
                <div
                  onClick={() => { setCompanyId(""); setDropdown(false); }}
                  style={{
                    padding: "10px 16px", fontSize: 13, cursor: "pointer",
                    color: "#aaa", fontStyle: "italic",
                    borderBottom: "1px solid #f5f5f5",
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f9f9f9"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  All companies
                </div>
                {MOCK_COMPANIES_COURSES.filter(c => c.id !== 0).map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setCompanyId(String(c.id)); setDropdown(false); }}
                    style={{
                      padding: "10px 16px", fontSize: 13, cursor: "pointer",
                      fontWeight: companyId === String(c.id) ? 700 : 400,
                      color: companyId === String(c.id) ? "#FF6B00" : "#333",
                      background: companyId === String(c.id) ? "#FFF0E6" : "transparent",
                      borderBottom: "1px solid #f5f5f5",
                      transition: "background .15s",
                    }}
                    onMouseEnter={e => {
                      if (companyId !== String(c.id)) (e.currentTarget as HTMLDivElement).style.background = "#f9f9f9";
                    }}
                    onMouseLeave={e => {
                      if (companyId !== String(c.id)) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── User list ── */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {/* Select all row */}
          {filtered.length > 0 && (
            <div
              onClick={toggleAll}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 24px",
                borderBottom: "1px solid #f5f5f5",
                cursor: "pointer", background: "#fafafa",
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                border: `2px solid ${selected.length === filtered.length ? "#FF6B00" : "#ddd"}`,
                background: selected.length === filtered.length ? "#FF6B00" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all .15s",
              }}>
                {selected.length === filtered.length && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 6 5 9 10 3"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>
                {selected.length === filtered.length ? "Deselect all" : "Select all"} ({filtered.length})
              </span>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{
              padding: "32px 24px", textAlign: "center",
              color: "#bbb", fontSize: 13, fontStyle: "italic",
            }}>
              {companyId || search
                ? "No users found matching your filters."
                : "No users available for assignment."}
            </div>
          ) : (
            filtered.map(user => {
              const isSelected = selected.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 24px",
                    borderBottom: "1px solid #f8f8f8",
                    cursor: "pointer",
                    background: isSelected ? "#FFF8F3" : "transparent",
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#fafafa";
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    border: `2px solid ${isSelected ? "#FF6B00" : "#ddd"}`,
                    background: isSelected ? "#FF6B00" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all .15s",
                  }}>
                    {isSelected && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                        stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "#e8e0d8", overflow: "hidden",
                    border: "2px solid #ddd", flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 100 100" width="38" height="38">
                      <circle cx="50" cy="50" r="50" fill="#e8e0d8"/>
                      <circle cx="50" cy="36" r="18" fill="#b0a090"/>
                      <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>
                      {user.email} · {user.department}
                    </div>
                  </div>

                  {/* Company badge */}
                  <div style={{
                    fontSize: 11, color: "#888",
                    background: "#f5f5f5", borderRadius: 20,
                    padding: "3px 10px", whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {user.company.split(" ")[0]}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid #f0f0f0",
          background: "#fafafa",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: selected.length > 0 ? "#FF6B00" : "#aaa",
          }}>
            {selected.length > 0
              ? `${selected.length} user${selected.length > 1 ? "s" : ""} selected`
              : "No users selected"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              padding: "9px 22px", background: "#f0f0f0",
              color: "#555", border: "none", borderRadius: 8,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "background .15s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#e0e0e0"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "#f0f0f0"}
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selected.length === 0}
              style={{
                padding: "9px 22px",
                background: selected.length > 0 ? "#FF6B00" : "#ccc",
                color: "#fff", border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: 13,
                cursor: selected.length > 0 ? "pointer" : "not-allowed",
                fontFamily: "'Inter', sans-serif",
                transition: "opacity .15s",
              }}
              onMouseEnter={e => { if (selected.length > 0) (e.currentTarget as HTMLButtonElement).style.opacity = ".88"; }}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
            >
              Assign Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUsersModal;
