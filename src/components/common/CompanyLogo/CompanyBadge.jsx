const CompanyBadge = ({ company, size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: company.color + "22",
      border: `2px solid ${company.color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
    }}
  >
    {typeof company.logo === "string" && company.logo.startsWith("/") ? (
      <img
        src={company.logo}
        alt={company.name}
        style={{ width: "80%", height: "80%", objectFit: "contain" }}
      />
    ) : (
      <span style={{
        fontWeight: 900,
        fontSize: size * 0.28,
        color: company.color,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: 1,
      }}>
        {company.logo}
      </span>
    )}
  </div>
);

export default CompanyBadge;