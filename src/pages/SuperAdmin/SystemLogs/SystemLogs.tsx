// src/pages/SuperAdmin/SystemLogs/SystemLogs.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface LogEntry {
  id: number;
  action: string;
  table_name: string | null;
  record_id: number | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user_id: string | null;
}

const actionColors: Record<string, { bg: string; color: string }> = {
  INSERT: { bg: "#d5f5e0", color: "#1e8449" },
  UPDATE: { bg: "#FFF0E6", color: "#FF6B00" },
  DELETE: { bg: "#fee2e2", color: "#DC2626" },
};

const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        setLogs(data ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = logs.filter(l => {
    if (actionFilter !== "All" && l.action !== actionFilter) return false;
    if (search && !(l.action + l.table_name + l.record_id).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--color-text-header)", margin: "0 0 6px" }}>System Logs</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>Audit trail of all system actions and changes.</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid var(--color-border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--color-surface)", color: "var(--color-text)", boxSizing: "border-box" }} />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid var(--color-border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "var(--color-surface)", color: "var(--color-text)", cursor: "pointer" }}>
          <option value="All">All Actions</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}>
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--color-text-muted)" }}>Loading logs…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--color-text-muted)" }}>
            {logs.length === 0 ? "No audit logs recorded yet." : "No logs match your filters."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Action", "Table", "Record ID", "Timestamp", "Details"].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 16px", textAlign: "left", background: "var(--color-bg-subtle)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const meta = actionColors[log.action] ?? { bg: "var(--color-bg-subtle)", color: "var(--color-text-muted)" };
                  return (
                    <>
                      <tr key={log.id} style={{ background: expanded === log.id ? "var(--color-bg-subtle)" : "var(--color-surface)" }}>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
                          <span style={{ background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.08em" }}>{log.action}</span>
                        </td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-text)", fontFamily: "monospace" }}>{log.table_name ?? "—"}</td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-text-muted)" }}>{log.record_id ?? "—"}</td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                          {new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
                          {(log.old_value || log.new_value) && (
                            <button onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "var(--color-text-muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                              {expanded === log.id ? "Hide" : "View"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expanded === log.id && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={5} style={{ padding: "12px 16px", background: "var(--color-bg-subtle)", borderBottom: "1px solid var(--color-border)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                              {log.old_value && <div><p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Old Value</p><pre style={{ margin: 0, fontSize: 12, color: "#DC2626", background: "#fee2e2", padding: 10, borderRadius: 8, overflow: "auto", maxHeight: 120 }}>{log.old_value}</pre></div>}
                              {log.new_value && <div><p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>New Value</p><pre style={{ margin: 0, fontSize: 12, color: "#1e8449", background: "#d5f5e0", padding: 10, borderRadius: 8, overflow: "auto", maxHeight: 120 }}>{log.new_value}</pre></div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
