import { useState, useRef, useCallback, createContext, useContext } from "react";
import "./SettingsCard.css";

/**
 * SettingsCard — Reusable Settings layout with tab navigation
 *
 * Props:
 *  - tabs:       Array of { key, label, icon? } for the sidebar nav
 *  - defaultTab: Initial active tab key (default: first tab)
 *  - title:      Page title (default: "Settings")
 *  - children:   <SettingsCard.Section sectionKey="..."> wrappers
 */

const SettingsCardContext = createContext({ registerRef: () => {} });

const SettingsCard = ({ tabs = [], defaultTab, title = "Settings", children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || "");
  const refsMap = useRef({});

  const registerRef = useCallback((key, ref) => {
    refsMap.current[key] = ref;
  }, []);

  const handleTabClick = (key) => {
    setActiveTab(key);
    refsMap.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SettingsCardContext.Provider value={{ registerRef }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 24px", color: "#1a1a1a" }}>
        {title}
      </h1>

      <div className="settings-grid-layout">
        {/* Floating Nav */}
        <aside className="settings-sidebar-nav">
          <div className="settings-nav-card-fixed">
            {tabs.map(({ key, label }) => (
              <div
                key={key}
                className={`settings-nav-card-item ${activeTab === key ? "active" : ""}`}
                onClick={() => handleTabClick(key)}
              >
                {label}
              </div>
            ))}
          </div>
        </aside>

        {/* Scrollable Sections */}
        <main className="settings-content-sections">
          {children}
          <div style={{ height: 200 }} />
        </main>
      </div>
    </SettingsCardContext.Provider>
  );
};

/* ── Section sub-component ── */
const Section = ({ sectionKey, children }) => {
  const { registerRef } = useContext(SettingsCardContext);
  const ref = useRef(null);

  // Register on mount
  const setRef = useCallback(
    (node) => {
      ref.current = node;
      if (node) registerRef(sectionKey, node);
    },
    [sectionKey, registerRef]
  );

  return <div ref={setRef}>{children}</div>;
};

SettingsCard.Section = Section;

export default SettingsCard;
