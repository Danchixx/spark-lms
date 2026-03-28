// src/pages/SuperAdmin/Courses/components/CourseDetail.jsx

import { useState, useMemo, useEffect } from "react";
import { MOCK_ENROLLED_USERS } from "../../../../data/mockCourses";
import AssignUsersModal from "./AssignUsersModal";

// ── SUPABASE INTEGRATION (uncomment when ready):
// import { fetchCourseDetail, removeUserFromCourse } from '../../../../data/mockCourses';
// useEffect(() => { fetchCourseDetail(course.id).then(setDetail); }, [course.id]);

const ITEMS_PER_PAGE = 5;

// ── Progress bar ──────────────────────────────────────────────
const ProgressBar = ({ value }) => {
  const color = value === 100 ? "#27ae60" : value >= 50 ? "#FF6B00" : value > 0 ? "#e67e22" : "#e0e0e0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
      <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.max(value, value > 0 ? 3 : 0)}%`,
          background: color, borderRadius: 99, transition: "width .4s ease",
        }} />
      </div>
      <span style={{ fontSize: 12, color: "#666", fontWeight: 600, minWidth: 34, textAlign: "right" }}>
        {value}%
      </span>
    </div>
  );
};

// ── Remove confirm dialog ─────────────────────────────────────
const RemoveConfirmModal = ({ user, onClose, onConfirm }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.5)", zIndex: 1100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16,
        width: "min(460px, 96vw)", padding: 32,
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
        textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "#fde8e8", margin: "0 auto 16px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#222", marginBottom: 8 }}>
          Do you really want to remove this user?
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 1.5 }}>
          performing this action will permanently delete user's progress on this course
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0",
            background: "#e8e8e8", color: "#555",
            border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            fontFamily: "'Barlow', sans-serif",
            transition: "background .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#d8d8d8"}
            onMouseLeave={e => e.currentTarget.style.background = "#e8e8e8"}
          >
            Cancel
          </button>
          <button onClick={() => onConfirm(user)} style={{
            flex: 1, padding: "11px 0",
            background: "#e74c3c", color: "#fff",
            border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            fontFamily: "'Barlow', sans-serif",
            transition: "opacity .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Success toast ─────────────────────────────────────────────
const Toast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%",
      transform: "translateX(-50%)",
      background: "#1a1a1a", color: "#fff",
      borderRadius: 12, padding: "13px 22px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,.25)",
      zIndex: 1200, fontSize: 14, fontWeight: 600,
      animation: "slideUpToast .35s cubic-bezier(.22,1,.36,1)",
      whiteSpace: "nowrap",
    }}>
      <style>{`@keyframes slideUpToast { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: "#27ae60",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      {message}
    </div>
  );
};

// ── Main CourseDetail ─────────────────────────────────────────
const CourseDetail = ({ course, onBack }) => {
  const [enrolledUsers, setEnrolledUsers] = useState(
    MOCK_ENROLLED_USERS[course.id] || []
  );
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [showAssign, setShowAssign]   = useState(false);
  const [removeUser, setRemoveUser]   = useState(null);
  const [toast, setToast]             = useState(null);
  const [sortDir, setSortDir]         = useState("asc");

  const filtered = useMemo(() => {
    let r = enrolledUsers;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return [...r].sort((a, b) =>
      sortDir === "asc"
        ? a.company.localeCompare(b.company)
        : b.company.localeCompare(a.company)
    );
  }, [enrolledUsers, search, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const completedCount = enrolledUsers.filter(u => u.progress === 100).length;

  const handleRemoveConfirm = (user) => {
    // SUPABASE: await removeUserFromCourse(course.id, user.id);
    setEnrolledUsers(prev => prev.filter(u => u.id !== user.id));
    setRemoveUser(null);
    setToast(`${user.name} has been removed from "${course.title}"`);
  };

  const handleAssigned = (newUserIds) => {
    // In production, refetch enrolled users from Supabase
    // For now, just show a toast
    setToast(`${newUserIds.length} user${newUserIds.length > 1 ? "s" : ""} successfully assigned to "${course.title}"`);
  };

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, "...", totalPages];
    if (safePage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", safePage - 1, safePage, safePage + 1, "...", totalPages];
  };

  const pgBtn = (disabled) => ({
    minWidth: 32, height: 30, padding: "0 10px",
    border: "1px solid #ddd", background: "#fff",
    borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12, fontWeight: 500,
    color: disabled ? "#ccc" : "#555",
    opacity: disabled ? .5 : 1,
    fontFamily: "'Barlow', sans-serif",
  });

  return (
    <div style={{ padding: 24, fontFamily: "'Barlow', sans-serif" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#FFF0E6", color: "#FF6B00",
          border: "1.5px solid #FF6B00", borderRadius: 20,
          padding: "7px 16px", fontWeight: 700, fontSize: 12,
          cursor: "pointer", fontFamily: "'Barlow', sans-serif",
        }}>
          ← COURSES
        </button>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 24, color: "#222",
          textTransform: "uppercase", letterSpacing: ".04em",
        }}>
          Course Detail
        </div>
      </div>

      {/* ── Hero card ── */}
      <div style={{
        background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
        padding: 20, marginBottom: 20,
        display: "flex", gap: 20, alignItems: "flex-start",
        position: "relative",
      }}>
        {/* Thumbnail */}
        <div style={{
          width: 200, height: 130, borderRadius: 10,
          flexShrink: 0, overflow: "hidden",
          background: course.thumbColor || "#e8c9a0",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(255,107,0,0.15) 0%, rgba(255,107,0,0.40) 100%)",
          }} />
          <svg viewBox="0 0 200 130" width="200" height="130">
            <rect width="200" height="130" fill={course.thumbColor || "#e8c9a0"}/>
            <circle cx="100" cy="46" r="20" fill="rgba(255,255,255,0.22)"/>
            <ellipse cx="100" cy="100" rx="36" ry="24" fill="rgba(255,255,255,0.16)"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#222", marginBottom: 6 }}>
            {course.title}
          </div>
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 14 }}>
            {course.description}
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 0, flexWrap: "wrap",
            paddingTop: 12, borderTop: "1px solid #f0f0f0",
          }}>
            {[
              { label: `${enrolledUsers.length} Enrolled`, color: "#FF6B00", bold: true },
              { label: `${course.modules} Modules` },
              { label: `${course.units} Units` },
              { label: `Published ${course.publishedAt}` },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <span style={{
                  fontSize: 13, fontWeight: item.bold ? 700 : 500,
                  color: item.color || "#555",
                  padding: "0 16px",
                  borderLeft: i > 0 ? "1px solid #ddd" : "none",
                }}>
                  {item.label}
                </span>
              </div>
            ))}

            {/* Average completion */}
            <div style={{
              marginLeft: "auto", display: "flex",
              flexDirection: "column", alignItems: "flex-end", gap: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#aaa" }}>Average completion</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#FF6B00" }}>
                  {course.avgCompletion}%
                </span>
              </div>
              <div style={{ width: 160, height: 6, background: "#eee", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${course.avgCompletion}%`,
                  background: "#FF6B00", borderRadius: 99,
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#bbb" }}>
                {completedCount} of {enrolledUsers.length} enrolled users completed
              </div>
            </div>
          </div>
        </div>

        {/* Creator badge */}
        <div style={{
          position: "absolute", top: 16, right: 16,
          display: "flex", alignItems: "center", gap: 8,
          background: "#f9f9f9", border: "1px solid #eee",
          borderRadius: 20, padding: "6px 14px",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{course.createdBy}</div>
            <div style={{ fontSize: 10, color: "#aaa" }}>Course Creator</div>
          </div>
        </div>
      </div>

      {/* ── Enrolled Users table ── */}
      <div style={{
        background: "#fff", borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.04)",
        overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>
              Enrolled Users
            </span>
            <span style={{
              background: "#FFF0E6", color: "#FF6B00",
              fontSize: 12, fontWeight: 700,
              padding: "2px 10px", borderRadius: 20,
            }}>
              {enrolledUsers.length} users
            </span>
          </div>

          {/* Search */}
          <div style={{ marginLeft: "auto" }}>
            <div style={{
              display: "flex", alignItems: "center",
              border: "1.5px solid #e0e0e0", borderRadius: 24,
              padding: "7px 14px", gap: 8, transition: "border-color .2s",
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "#FF6B00"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "#e0e0e0"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search enrolled users ..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{
                  border: "none", outline: "none", width: 200,
                  fontSize: 13, fontFamily: "'Barlow', sans-serif",
                  color: "#333", background: "transparent",
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fff" }}>
              {[
                { label: "USER",       width: "25%" },
                { label: "COMPANY",    width: "22%", sortable: true },
                { label: "DEPARTMENT", width: "15%" },
                { label: "PROGRESS",   width: "18%" },
                { label: "ASSIGNED",   width: "12%" },
                { label: "ACTION",     width: "8%"  },
              ].map(h => (
                <th key={h.label} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 11, fontWeight: 700, color: "#888",
                  letterSpacing: ".1em", textTransform: "uppercase",
                  borderBottom: "1px solid #eee",
                  width: h.width,
                  cursor: h.sortable ? "pointer" : "default",
                  userSelect: "none",
                }}
                  onClick={() => h.sortable && setSortDir(d => d === "asc" ? "desc" : "asc")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {h.label}
                    {h.sortable && (
                      <span style={{ fontSize: 10, color: "#bbb" }}>
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} style={{
                  padding: "40px 16px", textAlign: "center",
                  color: "#bbb", fontSize: 13, fontStyle: "italic",
                }}>
                  No enrolled users found.
                </td>
              </tr>
            ) : paged.map((user, i) => (
              <tr key={user.id}
                style={{ borderBottom: i < paged.length - 1 ? "1px solid #f8f8f8" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#e8e0d8", overflow: "hidden",
                      border: "2px solid #ddd", flexShrink: 0,
                    }}>
                      <svg viewBox="0 0 100 100" width="36" height="36">
                        <circle cx="50" cy="50" r="50" fill="#e8e0d8"/>
                        <circle cx="50" cy="36" r="18" fill="#b0a090"/>
                        <ellipse cx="50" cy="85" rx="28" ry="20" fill="#b0a090"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#555" }}>{user.company}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#555" }}>{user.department}</td>
                <td style={{ padding: "13px 16px" }}><ProgressBar value={user.progress} /></td>
                <td style={{ padding: "13px 16px", fontSize: 12, color: "#555" }}>{user.assignedAt}</td>
                <td style={{ padding: "13px 16px" }}>
                  <button
                    onClick={() => setRemoveUser(user)}
                    title="Remove user"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "#f5f5f5", border: "1px solid #eee",
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      transition: "all .15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#fde8e8";
                      e.currentTarget.style.borderColor = "#e74c3c";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#f5f5f5";
                      e.currentTarget.style.borderColor = "#eee";
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                      <line x1="18" y1="6" x2="23" y2="11"/>
                      <line x1="23" y1="6" x2="18" y2="11"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination + Assign button */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderTop: "1px solid #f0f0f0",
        }}>
          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1} style={pgBtn(safePage === 1)}>
              ‹ Previous
            </button>
            {getPages().map((p, i) =>
              p === "..." ? (
                <span key={`d${i}`} style={{ color: "#aaa", fontSize: 13, padding: "0 4px" }}>...</span>
              ) : (
                <button key={p} onClick={() => setPage(p)} style={{
                  ...pgBtn(false), minWidth: 32,
                  background: safePage === p ? "#FF6B00" : "#fff",
                  color: safePage === p ? "#fff" : "#555",
                  borderColor: safePage === p ? "#FF6B00" : "#ddd",
                  fontWeight: safePage === p ? 700 : 500,
                }}>{p}</button>
              )
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages} style={pgBtn(safePage === totalPages)}>
              Next ›
            </button>
          </div>

          {/* Assign users button */}
          <button
            onClick={() => setShowAssign(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#FF6B00", color: "#fff",
              border: "none", borderRadius: 20,
              padding: "9px 20px", fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "'Barlow', sans-serif",
              transition: "opacity .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <line x1="19" y1="8" x2="23" y2="8"/>
              <line x1="21" y1="6" x2="21" y2="10"/>
            </svg>
            Assign Users
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAssign && (
        <AssignUsersModal
          course={course}
          enrolledUserIds={enrolledUsers.map(u => u.id)}
          onClose={() => setShowAssign(false)}
          onAssigned={handleAssigned}
        />
      )}

      {removeUser && (
        <RemoveConfirmModal
          user={removeUser}
          onClose={() => setRemoveUser(null)}
          onConfirm={handleRemoveConfirm}
        />
      )}

      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
};

export default CourseDetail;
