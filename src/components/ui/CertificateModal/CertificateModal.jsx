import React from "react";
import Button from "../Button/Button";
import { X, Download, Share2 } from "lucide-react";
import sparkLogoImg from "../../common/SparkLogo/sparklogo.png";

// Assuming we get companyLogo as a prop from the parent
const CertificateModal = ({ isOpen, onClose, userName, courseName, date, companyLogo }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}
      </style>

      <div style={{
        background: "white",
        borderRadius: "12px",
        width: "100%", maxWidth: "1000px", // Increased for landscape
        height: "auto", maxHeight: "90vh", // Keep it within screen height
        display: "flex", flexDirection: "column",
        position: "relative",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        overflow: "hidden",
        fontFamily: "'Barlow', sans-serif"
      }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 20 }}
        >
          <X size={20} color="#333" />
        </button>

        {/* Certificate Paper Canvas - takes remaining space and scrolls if needed on small screens */}
        <div style={{ padding: "16px", position: "relative", background: "white", flex: 1, overflowY: "auto", overflowX: "hidden" }}>

          {/* Orange Corner SVG Overlays - Made slightly smaller vertically to fit screen */}
          <svg width="260" height="260" style={{ position: "absolute", top: 0, left: 0, zIndex: 10, pointerEvents: "none" }}>
            <polygon points="0,0 120,0 0,220" fill="rgba(255, 136, 0, 0.6)" />
            <polygon points="0,0 220,0 0,120" fill="#FF8C00" />
          </svg>
          <svg width="260" height="260" style={{ position: "absolute", bottom: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
            <polygon points="260,260 140,260 260,40" fill="rgba(255, 136, 0, 0.6)" />
            <polygon points="260,260 40,260 260,140" fill="#FF8C00" />
          </svg>

          {/* Inner Black Border Frame - padding and minHeight adjusted for landscape */}
          <div style={{ border: "1px solid #1a1a1a", position: "relative", zIndex: 1, padding: "24px 40px", background: "transparent", minHeight: "420px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {/* Logos */}
            <div style={{ display: "flex", justifyContent: "center", gap: 30, marginBottom: 16, alignItems: "center" }}>
              {/* Spark Logo */}
              <img src={sparkLogoImg} alt="Spark Logo" style={{ height: 32, objectFit: "contain" }} onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} />
              {/* Fallback text if image fails to load */}
              <div style={{ display: "none", fontSize: 20, fontWeight: 900, color: "#1a1a1a", alignItems: "center", gap: 6 }}>
                SPARK <span style={{ color: "#FF6B00", fontSize: 24 }}>🔥</span>
              </div>

              <div style={{ width: 2, height: 32, background: "#ddd" }} />

              {/* Company Logo */}
              {companyLogo ? (
                <img src={companyLogo} alt="Company Logo" style={{ height: 32, objectFit: "contain" }} />
              ) : (
                <div style={{ fontSize: 20, fontWeight: 900, color: "#00a8ff", display: "flex", flexDirection: "column", lineHeight: 0.9 }}>
                  <span>ZOU<span style={{ fontSize: 14, verticalAlign: "top" }}>↑</span>P</span>
                  <span style={{ fontSize: 7, letterSpacing: 2 }}>CORPORATION</span>
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <h1 style={{ fontFamily: "'Times New Roman', serif", fontSize: 40, letterSpacing: "14px", fontWeight: 700, margin: "0 0 6px 0", color: "#1a1a1a", textTransform: "uppercase" }}>Certificate</h1>
              <h2 style={{ fontFamily: "monospace", fontSize: 20, letterSpacing: "8px", fontWeight: 400, margin: 0, color: "#1a1a1a", textTransform: "uppercase" }}>Of Training</h2>

              {/* Ribbon Divder */}
              <div style={{ margin: "14px auto", width: 100, height: 1, background: "#1a1a1a", position: "relative" }}>
                <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 20, height: 8, border: "1px solid #1a1a1a", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "3px solid #1a1a1a" }}></div>
                  <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderRight: "3px solid #1a1a1a" }}></div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 15, color: "#1a1a1a", marginBottom: 6, fontWeight: 500 }}>This Certificate is Awarded to</p>

              {/* Elegant script name */}
              <h3 style={{
                fontFamily: "'Great Vibes', 'Brush Script MT', 'Lucida Handwriting', cursive",
                fontSize: 60, fontWeight: 400, margin: "0", color: "#1a1a1a",
                display: "inline-block", padding: "0 20px 2px 20px"
              }}>
                {userName}
              </h3>
              <div style={{ height: 1, background: "#888", width: "70%", margin: "0 auto" }}></div>
            </div>

            <div style={{ textAlign: "center", fontSize: 13, color: "#444", lineHeight: 1.5, maxWidth: 800, margin: "0 auto 24px" }}>
              For successfully completing the course program on <strong>{courseName}</strong> at {date}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>

            {/* Signatures */}
            <div style={{ display: "flex", justifyContent: "space-around", padding: "0 20px", marginTop: "auto", marginBottom: 24 }}>
              <div style={{ textAlign: "center", width: 200 }}>
                <div style={{ borderBottom: "1px solid #888", height: 30, marginBottom: 6 }}></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Prince Datu</div>
                <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase" }}>SPARK CRO</div>
              </div>
              <div style={{ textAlign: "center", width: 200 }}>
                <div style={{ borderBottom: "1px solid #888", height: 30, marginBottom: 6 }}></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Regina Schelle Palabrica</div>
                <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase" }}>SPARK HR</div>
              </div>
            </div>

            {/* Footer details */}
            <div style={{ fontSize: 10, color: "#888", position: "absolute", bottom: -20, left: 0 }}>
              Cert ID: SPK-2026-0227-DG-SF01
            </div>

          </div>
        </div>

        {/* Action Buttons Background Bar - Fixed at bottom */}
        <div style={{ background: "#f9f9f9", padding: "16px 24px", display: "flex", justifyContent: "center", gap: 16, borderTop: "1px solid #eee", zIndex: 20 }}>
          <Button variant="outline" leftIcon={<Download size={18} />}>Download PDF</Button>
          <Button variant="outline" leftIcon={<Share2 size={18} />}>Share</Button>
          <Button variant="primary" style={{ minWidth: 120 }} onClick={onClose}>Close</Button>
        </div>

      </div>
    </div>
  );
};

export default CertificateModal;
