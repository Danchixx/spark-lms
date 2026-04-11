// src/pages/SuperAdmin/Approvals/components/ApprovalCompanies.tsx
import type { ApprovalCompany } from "../SparkApprovals";

interface UserAvatarProps {
  size?: number;
  color?: string;
  abbr?: string;
}

const UserAvatar = ({ size = 60, color = "#ccc", abbr = "?" }: UserAvatarProps) => (
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

    <UserAvatar size={80} color={company.color} abbr={company.abbr} />

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

const ApprovalCompanies = ({ companies, onSelect }: ApprovalCompaniesProps) => (
  <div style={{
    padding: 24,
    minHeight: "100%",
    background: "#f4f4f4",
  }}>
    <div style={{
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700, fontSize: 30,
      color: "#222", marginBottom: 24,
      letterSpacing: ".05em", textTransform: "uppercase",
    }}>
      Pending Approvals
    </div>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: 16,
    }}>
      {companies.map(company => (
        <CompanyCard
          key={company.id}
          company={company}
          onClick={onSelect}
        />
      ))}
    </div>
  </div>
);

export default ApprovalCompanies;
