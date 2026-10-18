import React, { useEffect } from "react";
import { EvaluationFormConfig, EvaluationAnswer, getScaleValues } from "../../../types/evaluation";
import "./Evaluation.css";

interface EvaluationFormViewProps {
  config: EvaluationFormConfig;
  answers?: EvaluationAnswer;
  onAnswerChange?: (answers: EvaluationAnswer) => void;
  readOnly?: boolean;
}

export const EvaluationFormView: React.FC<EvaluationFormViewProps> = ({
  config,
  answers = { ratings: {}, feedback: {} },
  onAnswerChange,
  readOnly = false,
}) => {
  const ratings = answers?.ratings || {};
  const feedback = answers?.feedback || {};

  const handleRatingSelect = (statementId: string, value: number) => {
    if (readOnly || !onAnswerChange) return;
    const newRatings = { ...ratings, [statementId]: value };
    onAnswerChange({
      ratings: newRatings,
      feedback: { ...feedback },
    });
  };

  const handleFeedbackChange = (promptId: string, text: string) => {
    if (readOnly || !onAnswerChange) return;
    const newFeedback = { ...feedback, [promptId]: text };
    onAnswerChange({
      ratings: { ...ratings },
      feedback: newFeedback,
    });
  };

  // Default every statement to the highest value in its scale so the
  // displayed number is also what gets submitted if the learner doesn't change it.
  useEffect(() => {
    if (readOnly || !onAnswerChange) return;
    const defaults: Record<string, number> = {};
    config.parts?.forEach((part) => {
      if (part.type !== "rating_scale") return;
      const max = getScaleValues(part)[0] ?? 5;
      part.sections?.forEach((sec) =>
        sec.statements?.forEach((st) => {
          if (ratings[st.id] === undefined) defaults[st.id] = max;
        })
      );
    });
    if (Object.keys(defaults).length > 0) {
      onAnswerChange({ ratings: { ...ratings, ...defaults }, feedback: { ...feedback } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, readOnly]);

  return (
    <div className="evaluation-container">
      {config.title && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "var(--color-text-header)" }}>
            {config.title}
          </h2>
          {config.description && (
            <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", margin: 0 }}>
              {config.description}
            </p>
          )}
        </div>
      )}

      {config.parts?.map((part, pIdx) => {
        const isRatingScale = part.type === "rating_scale";
        const scaleValues = getScaleValues(part);

        return (
          <div key={part.id || `part-${pIdx}`} className="eval-part-block">
            {/* Part Title Header (e.g. Part I. Rating Scale) */}
            <div className="eval-part-title">
              {part.part_number ? `${part.part_number}. ` : ""}{part.title}
            </div>

            {/* Instruction line */}
            {part.instruction && (
              <div className="eval-instruction">
                <strong>Instruction:</strong> {part.instruction}
              </div>
            )}

            {/* Scale note for rating scale parts */}
            {isRatingScale && (
              <div className="eval-scale-legend">
                <span className="eval-scale-item">
                  Rate each statement from <strong>{scaleValues[scaleValues.length - 1]}</strong> (lowest) to <strong>{scaleValues[0]}</strong> (highest).
                </span>
              </div>
            )}

            {/* If rating scale: render sections (A, B, C, D...) */}
            {isRatingScale && (
              <div>
                {part.sections?.map((section, sIdx) => (
                  <div key={section.id || `sec-${sIdx}`} className="eval-section-block">
                    {/* Section title (e.g. A. Course Content and Learning) */}
                    <div className="eval-section-title">
                      {section.letter ? `${section.letter}. ` : ""}{section.title}
                    </div>

                    {/* Table of statements */}
                    <div className="eval-table-wrapper">
                      <table className="eval-table">
                        <thead>
                          <tr>
                            <th className="statement-col">Statement</th>
                            <th className="rating-col eval-rating-head">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.statements?.map((stmt, stmtIdx) => {
                            const current = ratings[stmt.id] ?? scaleValues[0];
                            return (
                              <tr key={stmt.id || `stmt-${stmtIdx}`}>
                                <td className="statement-cell">
                                  {stmt.number ? `${stmt.number}. ` : ""}{stmt.text}
                                </td>
                                <td className="rating-cell eval-rating-cell">
                                  {readOnly ? (
                                    <span className="eval-rating-readonly">
                                      {ratings[stmt.id] ?? "—"}
                                    </span>
                                  ) : (
                                    <select
                                      className="eval-rating-select"
                                      value={current}
                                      aria-label={`Rating for: ${stmt.text}`}
                                      onChange={(e) => handleRatingSelect(stmt.id, Number(e.target.value))}
                                    >
                                      {scaleValues.map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                      ))}
                                    </select>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* If open feedback: render open-ended feedback prompts */}
            {!isRatingScale && (
              <div className="eval-feedback-list">
                {part.feedback_questions?.map((fb, fbIdx) => {
                  const val = feedback[fb.id] || "";
                  return (
                    <div key={fb.id || `fb-${fbIdx}`} className="eval-feedback-item">
                      <div className="eval-feedback-prompt">
                        {fb.number ? `${fb.number}. ` : ""}{fb.prompt}
                      </div>
                      {readOnly ? (
                        <div
                          style={{
                            padding: "12px 14px",
                            borderRadius: 8,
                            background: "var(--color-bg-subtle)",
                            border: "1px solid var(--color-border)",
                            fontSize: 13.5,
                            lineHeight: 1.5,
                            color: val ? "var(--color-text)" : "var(--color-text-muted)",
                            fontStyle: val ? "normal" : "italic",
                            minHeight: 48,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {val || "No response provided"}
                        </div>
                      ) : (
                        <textarea
                          className="eval-feedback-input"
                          rows={3}
                          placeholder="Type your feedback here..."
                          value={val}
                          onChange={(e) => handleFeedbackChange(fb.id, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer thank you message */}
      {config.footer_message && (
        <div className="eval-footer-message">
          {config.footer_message}
        </div>
      )}
    </div>
  );
};
