import { useState, useRef, useCallback, createContext, useContext, useEffect } from "react";
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

type TabItem = {
  key: string;
  label: string;
  icon?: React.ComponentType;
};

type SettingsCardProps = {
  tabs?: TabItem[];
  defaultTab?: string;
  title?: string;
  children?: React.ReactNode;
};

const SettingsCardContext = createContext<{ registerRef: (key: string, ref: HTMLDivElement) => void }>({ registerRef: () => { } });

const SettingsCard = ({ tabs = [], defaultTab, title = "Settings", children }: SettingsCardProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || "");
  const refsMap = useRef<Record<string, HTMLDivElement>>({});

  const isProgrammaticScroll = useRef(false);

  const registerRef = useCallback((key: string, ref: HTMLDivElement) => {
    refsMap.current[key] = ref;
  }, []);

  useEffect(() => {
    if (defaultTab) {
      isProgrammaticScroll.current = true;
      setTimeout(() => {
        refsMap.current[defaultTab]?.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { isProgrammaticScroll.current = false; }, 1000);
      }, 100);
    }
  }, [defaultTab]);

  // Observer to sync tabs with scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        // Find the first intersecting entry
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          // Identify which one is "most" at top
          const topOne = intersecting.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (topOne) {
            setActiveTab(topOne.target.getAttribute("data-section") || "");
          }
        }
      },
      {
        root: null,
        rootMargin: "-10% 0px -70% 0px", // Focus on top portion of scroll area
        threshold: 0
      }
    );

    // Initial observe
    Object.values(refsMap.current).forEach(node => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [tabs]);

  const handleTabClick = (key: string) => {
    isProgrammaticScroll.current = true;
    setActiveTab(key);
    refsMap.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    
    // Unlock after scroll finishes
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);
  };

  return (
    <SettingsCardContext.Provider value={{ registerRef }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", margin: "0 0 24px", color: "var(--color-text-header)" }}>
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
          <div style={{ height: 400 }} />
        </main>
      </div>
    </SettingsCardContext.Provider>
  );
};

/* ── Section sub-component ── */
const Section = ({ sectionKey, children }: { sectionKey: string; children: React.ReactNode }) => {
  const { registerRef } = useContext(SettingsCardContext);
  const ref = useRef<HTMLDivElement | null>(null);

  // Register on mount
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      if (node) registerRef(sectionKey, node);
    },
    [sectionKey, registerRef]
  );

  const margin = sectionKey === "company" ? 150 : 47;
  return <div ref={setRef} data-section={sectionKey} style={{ scrollMarginTop: margin }}>{children}</div>;
};

SettingsCard.Section = Section;

export default SettingsCard;
