type CompanyBadgeProps = {
  company: { logo_url?: string | null; name?: string; color?: string | null };
  size?: number;
};

const CompanyBadge = ({ company, size = 48 }: CompanyBadgeProps) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: "white",
      border: `1.5px solid #e0e0e0`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
    }}
  >
    {typeof company.logo_url === "string" && company.logo_url.startsWith("http") ? (
      <img
        src={company.logo_url}
        alt={company.name}
        style={{ width: "80%", height: "80%", objectFit: "contain" }}
      />
    ) : (
      <span style={{
        fontWeight: 900,
        fontSize: size * 0.28,
        color: company.color || "#FF6B00",
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: 1,
      }}>
        {company.logo_url || company.name?.substring(0, 2).toUpperCase()}
      </span>
    )}
  </div>
);

export default CompanyBadge;