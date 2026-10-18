import React, { useState } from "react";
import {
  EvaluationFormConfig,
  EvaluationPart,
  EvaluationSection,
  EvaluationStatement,
  EvaluationFeedbackPrompt,
  createDefaultEvaluationConfig,
} from "../../../types/evaluation";
import { EvaluationFormView } from "./EvaluationFormView";
import {
  Plus,
  Trash2,
  Eye,
  Edit3,
  RotateCcw,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./Evaluation.css";

interface EvaluationBuilderProps {
  config: EvaluationFormConfig;
  onChange: (config: EvaluationFormConfig) => void;
}

export const EvaluationBuilder: React.FC<EvaluationBuilderProps> = ({
  config,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [collapsedParts, setCollapsedParts] = useState<Record<string, boolean>>({});

  const toggleCollapse = (partId: string) => {
    setCollapsedParts((prev) => ({ ...prev, [partId]: !prev[partId] }));
  };

  // Helper to update root config
  const updateConfig = (patch: Partial<EvaluationFormConfig>) => {
    onChange({ ...config, ...patch });
  };

  // ── Part Management ──
  const addPart = (type: "rating_scale" | "open_feedback") => {
    const partNumber = `Part ${toRoman(config.parts.length + 1)}`;
    const newPart: EvaluationPart = {
      id: `part-${Date.now()}`,
      part_number: partNumber,
      title: type === "rating_scale" ? "Rating Scale" : "Open-Ended Feedback",
      type,
      instruction:
        type === "rating_scale"
          ? "For each statement, tick (✓) the number that best describes your level of agreement."
          : "Please share your thoughts and recommendations.",
      scale_min: type === "rating_scale" ? 1 : undefined,
      scale_max: type === "rating_scale" ? 5 : undefined,
      sections:
        type === "rating_scale"
          ? [
              {
                id: `sec-${Date.now()}`,
                letter: "A",
                title: "New Section",
                statements: [
                  {
                    id: `stmt-${Date.now()}`,
                    number: getNextStatementNumber(config),
                    text: "Statement 1...",
                  },
                ],
              },
            ]
          : undefined,
      feedback_questions:
        type === "open_feedback"
          ? [
              {
                id: `fb-${Date.now()}`,
                number: getNextFeedbackNumber(config),
                prompt: "What improvements would you suggest?",
              },
            ]
          : undefined,
    };

    updateConfig({ parts: [...config.parts, newPart] });
  };

  const removePart = (partId: string) => {
    updateConfig({ parts: config.parts.filter((p) => p.id !== partId) });
  };

  const updatePart = (partId: string, patch: Partial<EvaluationPart>) => {
    updateConfig({
      parts: config.parts.map((p) => (p.id === partId ? { ...p, ...patch } : p)),
    });
  };

  // ── Section Management ──
  const addSection = (partId: string) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;

    const currentSections = part.sections || [];
    const nextLetter = String.fromCharCode(65 + (currentSections.length % 26));
    const nextStmtNum = getNextStatementNumber(config);

    const newSection: EvaluationSection = {
      id: `sec-${Date.now()}`,
      letter: nextLetter,
      title: "New Section Title",
      statements: [
        {
          id: `stmt-${Date.now()}`,
          number: nextStmtNum,
          text: "Statement description here...",
        },
      ],
    };

    updatePart(partId, {
      sections: [...currentSections, newSection],
    });
  };

  const removeSection = (partId: string, secId: string) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    updatePart(partId, {
      sections: (part.sections || []).filter((s) => s.id !== secId),
    });
  };

  const updateSection = (
    partId: string,
    secId: string,
    patch: Partial<EvaluationSection>
  ) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    updatePart(partId, {
      sections: (part.sections || []).map((s) =>
        s.id === secId ? { ...s, ...patch } : s
      ),
    });
  };

  // ── Statement Management ──
  const addStatement = (partId: string, secId: string) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    const section = (part.sections || []).find((s) => s.id === secId);
    if (!section) return;

    const nextStmtNum = getNextStatementNumber(config);
    const newStmt: EvaluationStatement = {
      id: `stmt-${Date.now()}`,
      number: nextStmtNum,
      text: "New statement...",
    };

    updateSection(partId, secId, {
      statements: [...(section.statements || []), newStmt],
    });
  };

  const removeStatement = (partId: string, secId: string, stmtId: string) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    const section = (part.sections || []).find((s) => s.id === secId);
    if (!section) return;

    updateSection(partId, secId, {
      statements: (section.statements || []).filter((st) => st.id !== stmtId),
    });
  };

  const updateStatement = (
    partId: string,
    secId: string,
    stmtId: string,
    patch: Partial<EvaluationStatement>
  ) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    const section = (part.sections || []).find((s) => s.id === secId);
    if (!section) return;

    updateSection(partId, secId, {
      statements: (section.statements || []).map((st) =>
        st.id === stmtId ? { ...st, ...patch } : st
      ),
    });
  };

  // ── Open-Ended Feedback Prompt Management ──
  const addFeedbackPrompt = (partId: string) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;

    const nextNum = getNextFeedbackNumber(config);
    const newPrompt: EvaluationFeedbackPrompt = {
      id: `fb-${Date.now()}`,
      number: nextNum,
      prompt: "Type your open-ended question here...",
    };

    updatePart(partId, {
      feedback_questions: [...(part.feedback_questions || []), newPrompt],
    });
  };

  const removeFeedbackPrompt = (partId: string, promptId: string) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    updatePart(partId, {
      feedback_questions: (part.feedback_questions || []).filter(
        (f) => f.id !== promptId
      ),
    });
  };

  const updateFeedbackPrompt = (
    partId: string,
    promptId: string,
    patch: Partial<EvaluationFeedbackPrompt>
  ) => {
    const part = config.parts.find((p) => p.id === partId);
    if (!part) return;
    updatePart(partId, {
      feedback_questions: (part.feedback_questions || []).map((f) =>
        f.id === promptId ? { ...f, ...patch } : f
      ),
    });
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Reset evaluation form to the default SPARK CPD template? This will replace your current edits."
      )
    ) {
      onChange(createDefaultEvaluationConfig());
    }
  };

  return (
    <div className="eval-builder-wrapper">
      {/* Top Tab Bar: Edit vs Preview */}
      <div className="eval-builder-tabs">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            className={`eval-builder-tab-btn ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <Edit3 size={14} /> Edit Evaluation Form
          </button>
          <button
            type="button"
            className={`eval-builder-tab-btn ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <Eye size={14} /> Live Learner Preview
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          style={{
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-text-muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
          title="Reset to default SPARK CPD questions and sections"
        >
          <RotateCcw size={12} /> Reset to SPARK Template
        </button>
      </div>

      {activeTab === "preview" ? (
        <div style={{ padding: "12px 6px" }}>
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(255, 107, 0, 0.08)",
              border: "1px solid rgba(255, 107, 0, 0.2)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#FF6B00",
              fontWeight: 600,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <HelpCircle size={15} />
            This is a live preview of how learners will interact with your evaluation form.
          </div>
          <EvaluationFormView config={config} readOnly={false} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Header configuration */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-header)" }}>
              Form Title
            </label>
            <input
              className="eval-input-text"
              value={config.title || ""}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="e.g., Course Evaluation Form"
            />
          </div>

          {/* Parts List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {config.parts?.map((part, pIdx) => {
              const isCollapsed = !!collapsedParts[part.id];
              const isRatingScale = part.type === "rating_scale";

              return (
                <div key={part.id || `part-${pIdx}`} className="eval-card-part">
                  {/* Part Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <span
                        style={{
                          background: "#FF6B00",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 4,
                          letterSpacing: 0.5,
                        }}
                      >
                        {part.type === "rating_scale" ? "EVALUATION PART" : "FEEDBACK PART"}
                      </span>
                      <input
                        className="eval-input-text"
                        style={{ width: 100, fontWeight: 700 }}
                        value={part.part_number}
                        onChange={(e) => updatePart(part.id, { part_number: e.target.value })}
                        placeholder="e.g. Part I"
                      />
                      <input
                        className="eval-input-text"
                        style={{ fontWeight: 700, color: "#FF6B00" }}
                        value={part.title}
                        onChange={(e) => updatePart(part.id, { title: e.target.value })}
                        placeholder="e.g. Rating Scale or Open-Ended Feedback"
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => toggleCollapse(part.id)}
                        className="eval-btn-icon"
                        title={isCollapsed ? "Expand part" : "Collapse part"}
                      >
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePart(part.id)}
                        className="eval-btn-icon"
                        title="Delete part"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {/* Part instruction */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--color-text-header)",
                          }}
                        >
                          Instruction for this Part
                        </label>
                        <input
                          className="eval-input-text"
                          value={part.instruction || ""}
                          onChange={(e) => updatePart(part.id, { instruction: e.target.value })}
                          placeholder="e.g., For each statement, tick (✓) the number that best describes your level of agreement."
                        />
                      </div>

                      {/* Rating scale range */}
                      {isRatingScale && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-header)" }}>
                            Rating Scale Range
                          </label>
                          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>From</span>
                          <input
                            type="number"
                            className="eval-input-text"
                            style={{ width: 70, textAlign: "center", fontWeight: 700 }}
                            min={0}
                            max={99}
                            value={part.scale_min ?? 1}
                            onChange={(e) => {
                              const v = Math.max(0, Math.min(99, Math.floor(Number(e.target.value))));
                              if (isNaN(v)) return;
                              const max = part.scale_max ?? 5;
                              updatePart(part.id, { scale_min: v, scale_max: Math.max(max, v) });
                            }}
                          />
                          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>to</span>
                          <input
                            type="number"
                            className="eval-input-text"
                            style={{ width: 70, textAlign: "center", fontWeight: 700 }}
                            min={1}
                            max={100}
                            value={part.scale_max ?? 5}
                            onChange={(e) => {
                              const v = Math.max(1, Math.min(100, Math.floor(Number(e.target.value))));
                              if (isNaN(v)) return;
                              const min = part.scale_min ?? 1;
                              updatePart(part.id, { scale_max: v, scale_min: Math.min(min, v) });
                            }}
                          />
                          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                            Learners pick from {part.scale_max ?? 5} down to {part.scale_min ?? 1} (default: {part.scale_max ?? 5}).
                          </span>
                        </div>
                      )}

                      {/* If Rating Scale: Sections A..D */}
                      {isRatingScale && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: "var(--color-text-header)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>Evaluation Topics & Statements (Rating Scale 5 to 1)</span>
                            <button
                              type="button"
                              className="eval-btn-add"
                              onClick={() => addSection(part.id)}
                            >
                              <Plus size={13} /> Add Topic
                            </button>
                          </div>

                          {part.sections?.map((sec, sIdx) => (
                            <div key={sec.id || `sec-${sIdx}`} className="eval-card-section">
                              {/* Section Letter & Title */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  justifyContent: "space-between",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                                  <input
                                    className="eval-input-text"
                                    style={{ width: 55, textAlign: "center", fontWeight: 800 }}
                                    value={sec.letter}
                                    onChange={(e) =>
                                      updateSection(part.id, sec.id, { letter: e.target.value })
                                    }
                                    placeholder="Letter"
                                    title="Topic Letter (e.g. A, B, C, D)"
                                  />
                                  <input
                                    className="eval-input-text"
                                    style={{ fontWeight: 700 }}
                                    value={sec.title}
                                    onChange={(e) =>
                                      updateSection(part.id, sec.id, { title: e.target.value })
                                    }
                                    placeholder="Topic Title (e.g. Course Content and Learning)"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSection(part.id, sec.id)}
                                  className="eval-btn-icon"
                                  title="Delete topic"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              {/* Statements list */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                  marginTop: 6,
                                }}
                              >
                                {sec.statements?.map((stmt, stmtIdx) => (
                                  <div key={stmt.id || `stmt-${stmtIdx}`} className="eval-input-row">
                                    <input
                                      className="eval-input-text"
                                      style={{
                                        width: 50,
                                        textAlign: "center",
                                        fontWeight: 700,
                                      }}
                                      value={stmt.number}
                                      onChange={(e) =>
                                        updateStatement(part.id, sec.id, stmt.id, {
                                          number: e.target.value,
                                        })
                                      }
                                      placeholder="#"
                                    />
                                    <input
                                      className="eval-input-text"
                                      value={stmt.text}
                                      onChange={(e) =>
                                        updateStatement(part.id, sec.id, stmt.id, {
                                          text: e.target.value,
                                        })
                                      }
                                      placeholder="Statement text..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeStatement(part.id, sec.id, stmt.id)}
                                      className="eval-btn-icon"
                                      title="Delete statement"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  className="eval-btn-add"
                                  onClick={() => addStatement(part.id, sec.id)}
                                  style={{ marginTop: 4 }}
                                >
                                  <Plus size={12} /> Add Statement
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* If Open-Ended Feedback Part: Prompt list */}
                      {!isRatingScale && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div
                            style={{
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: "var(--color-text-header)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>Open-Ended Feedback Questions</span>
                            <button
                              type="button"
                              className="eval-btn-add"
                              onClick={() => addFeedbackPrompt(part.id)}
                            >
                              <Plus size={13} /> Add Question
                            </button>
                          </div>

                          {part.feedback_questions?.map((fb, fbIdx) => (
                            <div key={fb.id || `fb-${fbIdx}`} className="eval-input-row">
                              <input
                                className="eval-input-text"
                                style={{ width: 50, textAlign: "center", fontWeight: 700 }}
                                value={fb.number}
                                onChange={(e) =>
                                  updateFeedbackPrompt(part.id, fb.id, { number: e.target.value })
                                }
                                placeholder="#"
                              />
                              <input
                                className="eval-input-text"
                                value={fb.prompt}
                                onChange={(e) =>
                                  updateFeedbackPrompt(part.id, fb.id, { prompt: e.target.value })
                                }
                                placeholder="Feedback question or prompt..."
                              />
                              <button
                                type="button"
                                onClick={() => removeFeedbackPrompt(part.id, fb.id)}
                                className="eval-btn-icon"
                                title="Delete question"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Part buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <button
              type="button"
              className="eval-btn-add"
              onClick={() => addPart("rating_scale")}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "rgba(255, 107, 0, 0.08)",
                color: "#FF6B00",
                borderColor: "#FF6B00",
              }}
            >
              <Plus size={14} /> Add Rating Scale Part
            </button>
            <button
              type="button"
              className="eval-btn-add"
              onClick={() => addPart("open_feedback")}
              style={{ padding: "8px 14px", borderRadius: 8 }}
            >
              <Plus size={14} /> Add Open-Ended Feedback Part
            </button>
          </div>

          {/* Footer message */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-header)" }}>
              Closing / Footer Message
            </label>
            <input
              className="eval-input-text"
              value={config.footer_message || ""}
              onChange={(e) => updateConfig({ footer_message: e.target.value })}
              placeholder="e.g., Thank you for completing this evaluation and for helping us improve SPARK CPD learning experiences."
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helpers ──
function toRoman(num: number): string {
  const romanNumerals: [string, number][] = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];
  let result = "";
  for (const [letter, val] of romanNumerals) {
    while (num >= val) {
      result += letter;
      num -= val;
    }
  }
  return result || "I";
}

function getNextStatementNumber(config: EvaluationFormConfig): number {
  let max = 0;
  for (const part of config.parts || []) {
    for (const sec of part.sections || []) {
      for (const st of sec.statements || []) {
        const n = Number(st.number);
        if (!isNaN(n) && n > max) max = n;
      }
    }
  }
  return max + 1;
}

function getNextFeedbackNumber(config: EvaluationFormConfig): number {
  let max = getNextStatementNumber(config) - 1;
  for (const part of config.parts || []) {
    for (const fb of part.feedback_questions || []) {
      const n = Number(fb.number);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return max + 1;
}
