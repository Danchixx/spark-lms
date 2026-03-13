import SparkLogo from "../../common/SparkLogo/sparklogo.png";

const SparkAdminHeader = () => (
  <div style={{ background: "#ffffff", padding: "6px 28px", display: "flex", alignItems: "center" }}>
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span style={{
        color: "white",
        fontWeight: 600,
        fontSize: 40,
        letterSpacing: 2,
        fontFamily: "'Sora', sans-serif",
      }}>
        SPARK
      </span>
      <span style={{
        color: "#aaa",
        fontFamily: "'Open Sans Regular', sans-serif",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        fontSize: 7.4,
        marginTop: 1,
        display: "block",
      }}>
        YES TO LEARNING AND DEVELOPMENT
      </span>
    </div>

    <img
      src={SparkLogo}
      alt="Spark Logo"
      style={{ height: 65, width: "auto" }}
    />
  </div>
);

export default SparkAdminHeader;
;