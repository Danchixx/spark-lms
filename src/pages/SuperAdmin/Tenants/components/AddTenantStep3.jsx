import { useState } from "react";

const AddTenantStep3 = ({ onNext, onBack, onCancel }) => {
  const [method, setMethod] = useState("palawan");

  return (
    <div style={s.card}>
      <div style={s.grid}>
        {/* Left: Payment options */}
        <div>
          <div style={s.subtitle}>SELECT PAYMENT OPTION</div>

          {/* Palawan Pay */}
          <div style={{ ...s.option, borderColor: method === "palawan" ? "#FF6B00" : "#e0e0e0" }}
            onClick={() => setMethod("palawan")}>
            <div style={s.optRow}>
              <input type="radio" readOnly checked={method === "palawan"}
                style={{ accentColor: "#FF6B00", width: 16, height: 16 }} />
              <span style={s.optLabel}>Palawan Pay</span>
              <span style={s.palawanBadge}>PalawanPay</span>
            </div>
          </div>

          {/* Credit Card */}
          <div style={{ ...s.option, borderColor: method === "card" ? "#FF6B00" : "#e0e0e0" }}
            onClick={() => setMethod("card")}>
            <div style={s.optRow}>
              <input type="radio" readOnly checked={method === "card"}
                style={{ accentColor: "#FF6B00", width: 16, height: 16 }} />
              <span style={s.optLabel}>Credit Card</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <span style={s.visaBadge}>VISA</span>
                <span style={s.mcBadge}>MC</span>
              </div>
            </div>
            {method === "card" && (
              <>
                <div style={{ fontSize: 11, color: "#aaa", marginLeft: 26,
                  marginTop: 4, marginBottom: 8 }}>
                  pay securely using your trusted cards
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #f0f0f0",
                  margin: "8px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={s.fieldLbl}>Card Number</div>
                    <input style={s.input} type="text" placeholder="1234 1234 1234 1234" />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 2 }}>
                      <div style={s.fieldLbl}>Name on card</div>
                      <input style={s.input} type="text" placeholder="Card name" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.fieldLbl}>Expire Date</div>
                      <input style={s.input} type="text" placeholder="MM/YY" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.fieldLbl}>CVV</div>
                      <input style={s.input} type="text" placeholder="CVV" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bank Deposit */}
          <div style={{ ...s.option, borderColor: method === "bank" ? "#FF6B00" : "#e0e0e0" }}
            onClick={() => setMethod("bank")}>
            <div style={s.optRow}>
              <input type="radio" readOnly checked={method === "bank"}
                style={{ accentColor: "#FF6B00", width: 16, height: 16 }} />
              <span style={s.optLabel}>Bank Deposit / Transfer</span>
              <span style={{ marginLeft: "auto", fontSize: 22 }}>🏦</span>
            </div>
          </div>

          <button style={s.paidBtn} onClick={onNext}>Paid</button>
          <div style={s.termsRow}>
            <input type="checkbox" defaultChecked
              style={{ width: 14, height: 14, accentColor: "#FF6B00" }} />
            <span style={{ fontSize: 11, color: "#888" }}>
              By clicking this, I agree to Spark's{" "}
              <span style={{ color: "#FF6B00", cursor: "pointer" }}>Terms and Conditions</span>
              {" "}and{" "}
              <span style={{ color: "#FF6B00", cursor: "pointer" }}>Privacy Policy</span>
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <button style={s.backTextBtn} onClick={onBack}>‹ Plan Selection</button>
          </div>
        </div>

        {/* Right: Proof of transaction */}
        <div>
          <div style={s.subtitle}>PROOF OF TRANSACTION</div>
          <div style={s.proofBox}>
            <div style={{ fontSize: 32 }}>☁️</div>
            <button style={s.browseBtn}>BROWSE</button>
            <div style={{ fontSize: 12, color: "#aaa" }}>drop a file here</div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 4 }}>
              * File supported jpg, png, &amp; webp
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <button style={s.cancelBtn} onClick={onCancel}>CANCEL</button>
            <button style={s.nextBtn} onClick={onNext}>NEXT</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  card: { background: "#fff", borderRadius: 10, border: "1px solid #eee",
    padding: 24, margin: "16px 0" },
  grid: { display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24 },
  subtitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase",
    color: "#888", marginBottom: 14 },
  option: { border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "13px 16px",
    marginBottom: 10, cursor: "pointer", transition: "border-color .15s" },
  optRow: { display: "flex", alignItems: "center", gap: 12 },
  optLabel: { fontWeight: 600, fontSize: 14 },
  palawanBadge: { marginLeft: "auto",
    background: "linear-gradient(135deg,#006633,#00a855)",
    color: "#fff", padding: "3px 8px", borderRadius: 4,
    fontSize: 10, fontWeight: 900 },
  visaBadge: { background: "#1a1f71", color: "#fff", padding: "2px 5px",
    borderRadius: 3, fontSize: 9, fontWeight: 700 },
  mcBadge: { background: "#eb001b", color: "#fff", padding: "2px 5px",
    borderRadius: 3, fontSize: 9, fontWeight: 700 },
  fieldLbl: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 4 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #ddd",
    borderRadius: 6, fontSize: 13, fontFamily: "'Barlow',sans-serif",
    outline: "none", boxSizing: "border-box" },
  paidBtn: { width: "100%", background: "#FF6B00", color: "#fff", border: "none",
    borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 15,
    cursor: "pointer", fontFamily: "'Barlow',sans-serif", marginTop: 4 },
  termsRow: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8 },
  backTextBtn: { display: "flex", alignItems: "center", gap: 4,
    background: "#FFF0E6", border: "1.5px solid #FF6B00", borderRadius: 20,
    padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700,
    color: "#FF6B00", fontFamily: "'Barlow',sans-serif" },
  proofBox: { border: "2px dashed #FF6B00", borderRadius: 8, padding: 30,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    cursor: "pointer", background: "#fafafa", minHeight: 160,
    justifyContent: "center" },
  browseBtn: { background: "#FF6B00", color: "#fff", border: "none",
    borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 12,
    cursor: "pointer", fontFamily: "'Barlow',sans-serif" },
  cancelBtn: { background: "#aaa", color: "#fff", border: "none", borderRadius: 8,
    padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer",
    fontFamily: "'Barlow',sans-serif" },
  nextBtn: { background: "#FF6B00", color: "#fff", border: "none", borderRadius: 8,
    padding: "9px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer",
    fontFamily: "'Barlow',sans-serif" },
};

export default AddTenantStep3;
