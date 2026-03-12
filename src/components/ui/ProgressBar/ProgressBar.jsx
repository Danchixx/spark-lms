const ProgressBar = ({ value }) => (
  <div style={{ width: 80, height: 7, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
    <div
      style={{
        width: `${value}%`,
        height: "100%",
        background: value === 100 ? "#27ae60" : "#FF6B00",
        borderRadius: 4,
      }}
    />
  </div>
);

export default ProgressBar;
