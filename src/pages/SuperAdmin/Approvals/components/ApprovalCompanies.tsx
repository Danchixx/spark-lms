// src/pages/SuperAdmin/Approvals/components/ApprovalCompanies.tsx
import { useState, useMemo } from "react";
import type { ApprovalCompany } from "../SparkApprovals";

interface UserAvatarProps {
  size?: number;
  color?: string;
  abbr?: string;
  logoUrl?: string;
}

const UserAvatar = ({ size = 60, color = "#ccc", abbr = "?", logoUrl }: UserAvatarProps) => (
  logoUrl ? (
    <div style={{
      width: size, height: size,
      borderRadius: 14,
      border: `1.5px solid #eee`,
      overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#fff",
      flexShrink: 0,
      padding: 10,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    }}>
      <img src={logoUrl} alt={abbr} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  ) : (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: color + "22",
      border: `2px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontWeight: 900, color,
      letterSpacing: 1,
      flexShrink: 0,
    }}>
      {abbr.slice(0, 5)}
    </div>
  )
);

interface CompanyCardProps {
  company: ApprovalCompany;
  onClick: (company: ApprovalCompany) => void;
}

const CompanyCard = ({ company, onClick }: CompanyCardProps) => (
  <div
    onClick={() => onClick(company)}
    style={{
      background: "#fff",
      borderRadius: 14,
      border: "none",
      boxShadow: "0 2px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)",
      padding: "28px 20px 18px",
      cursor: "pointer",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      transition: "transform .2s ease, box-shadow .2s ease",
      userSelect: "none",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,.13), 0 4px 8px rgba(0,0,0,.07)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)";
    }}
  >
    {company.pendingCount > 0 && (
      <div style={{
        position: "absolute",
        top: 10, right: 10,
        width: 26, height: 26,
        borderRadius: "50%",
        background: "#e74c3c",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {company.pendingCount}
      </div>
    )}

    <UserAvatar size={100} color={company.color} abbr={company.abbr} logoUrl={company.logo_url} />

    <div style={{
      fontSize: 13, fontWeight: 700, color: "#222",
      textAlign: "center", lineHeight: 1.3,
    }}>
      {company.name}
    </div>

    <div style={{
      fontSize: 11, color: "#aaa",
      textTransform: "uppercase", letterSpacing: ".08em",
    }}>
      {company.totalUsers} total users
    </div>
  </div>
);

interface ApprovalCompaniesProps {
  companies: ApprovalCompany[];
  onSelect: (company: ApprovalCompany) => void;
}

const ApprovalCompanies = ({ companies, onSelect }: ApprovalCompaniesProps) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(q));
  }, [companies, search]);

  return (
    <div style={{
      padding: 24,
      minHeight: "100%",
      background: "#f4f4f4",
    }}>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700, fontSize: 30,
        color: "#222", marginBottom: 20,
        letterSpacing: ".05em", textTransform: "uppercase",
      }}>
        Pending Approvals
      </div>

      {/* Filter bar */}
      <div style={{
        background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,.06)",
        padding: "14px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "#888",
          letterSpacing: ".08em", textTransform: "uppercase",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          Search for Company
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Type a company name..."
          style={{
            flex: 1, border: "1.5px solid #e0e0e0", borderRadius: 8,
            padding: "9px 14px", fontSize: 13,
            fontFamily: "'Inter', sans-serif", color: "#333",
            outline: "none", background: "#fafafa",
            transition: "border-color .2s, background .2s",
          }}
          onFocus={e => { e.target.style.borderColor = "#FF6B00"; e.target.style.background = "#fff"; }}
          onBlur={e => { e.target.style.borderColor = "#e0e0e0"; e.target.style.background = "#fafafa"; }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              padding: "7px 14px", borderRadius: 8,
              background: "#fff", color: "#888",
              border: "1.5px solid #ddd", fontSize: 12,
              fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap", transition: "all .15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#FF6B00"; (e.currentTarget as HTMLButtonElement).style.color = "#FF6B00"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ddd"; (e.currentTarget as HTMLButtonElement).style.color = "#888"; }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>
        Showing <strong style={{ color: "#333" }}>{filtered.length}</strong> of{" "}
        <strong style={{ color: "#333" }}>{companies.length}</strong> companies
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
      }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 20px", color: "#bbb", fontSize: 14 }}>
            No companies found matching "{search}"
          </div>
        ) : filtered.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default ApprovalCompanies;
