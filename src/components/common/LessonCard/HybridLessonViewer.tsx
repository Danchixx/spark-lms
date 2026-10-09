import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../ui/Button/Button";
import { Check, X, CheckCircle } from "lucide-react";
import { FileBlockViewer } from "./FileBlock";
import "../../ui/RichTextEditor/RichTextEditor.css";

interface HybridBlock {
  id: string;
  type: "reading" | "question" | "file";
  content?: string;
  question?: {
    question_text: string;
    question_type: string;
    choices: any[];
    correct_answers: string[];
  };
  file?: any;
  caption?: string;
  allowDownload?: boolean;
}

export default function HybridLessonViewer({ lesson }: { lesson: any }) {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<HybridBlock[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!lesson?.content) return;
    try {
      const parsed = JSON.parse(lesson.content);
      if (Array.isArray(parsed)) {
        setBlocks(parsed);
      } else {
        setBlocks([{ id: 'legacy-1', type: 'reading', content: lesson.content }]);
      }
    } catch {
      setBlocks([{ id: 'legacy-1', type: 'reading', content: lesson.content }]);
    }
  }, [lesson]);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!user?.id || !lesson?.id) return;
      const { data } = await supabase
        .from('hybrid_lesson_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id);

      if (data && data.length > 0) {
        const loadedResponses: Record<string, any> = {};
        const loadedRevealed: Record<string, boolean> = {};
        data.forEach(r => {
          loadedResponses[r.question_id] = r.answer_data;
          loadedRevealed[r.question_id] = true;
        });
        setResponses(loadedResponses);
        setRevealed(loadedRevealed);
      }
    };
    fetchResponses();
  }, [user, lesson]);

  const saveResponse = async (question_id: string, answer_data: any) => {
    if (!user?.id || !lesson?.id) return;
    
    setResponses(prev => ({ ...prev, [question_id]: answer_data }));
    setRevealed(prev => ({ ...prev, [question_id]: true }));

    await supabase
      .from('hybrid_lesson_responses')
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        question_id,
        answer_data
      }, { onConflict: 'user_id,lesson_id,question_id' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {blocks.map((block) => (
        <div key={block.id}>
          {block.type === 'reading' ? (
            <div 
              className="tiptap-content sun-editor-editable" 
              dangerouslySetInnerHTML={{ __html: block.content || "" }}
            />
          ) : block.type === 'file' ? (
            <FileBlockViewer block={block as any} />
          ) : block.type === 'question' && block.question ? (
            <div style={{ padding: 24, background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-header)', marginBottom: 16 }}>
                {block.question.question_text}
              </div>

              {/* Multiple Choice & True/False */}
              {(block.question.question_type === 'multiple_choice' || block.question.question_type === 'true_false') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {block.question.choices.map((choice: any) => {
                    const isSelected = responses[block.id] === choice.id;
                    const isRevealed = revealed[block.id];
                    const isCorrect = choice.is_correct;
                    
                    let bg = "var(--color-bg)";
                    let border = "1px solid var(--color-border)";
                    let textColor = "var(--color-text)";
                    let icon = null;

                    if (isRevealed) {
                      if (isCorrect) {
                        bg = "rgba(76, 175, 80, 0.1)";
                        border = "2px solid #4CAF50";
                        textColor = "#4CAF50";
                        icon = <CheckCircle size={18} color="#4CAF50" />;
                      } else if (isSelected && !isCorrect) {
                        bg = "rgba(244, 67, 54, 0.1)";
                        border = "2px solid #F44336";
                        textColor = "#F44336";
                        icon = <X size={18} color="#F44336" />;
                      }
                    } else if (isSelected) {
                      border = "2px solid var(--color-primary)";
                      bg = "var(--color-primary-subtle)";
                    }

                    return (
                      <div 
                        key={choice.id}
                        onClick={() => !isRevealed && setResponses({ ...responses, [block.id]: choice.id })}
                        style={{
                          padding: "12px 16px", borderRadius: 8, border, background: bg, color: textColor,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          cursor: isRevealed ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s"
                        }}
                      >
                        {choice.choice_text}
                        {icon}
                      </div>
                    );
                  })}
                  {!revealed[block.id] && (
                    <Button 
                      variant="primary" 
                      rounded="pill" 
                      onClick={() => saveResponse(block.id, responses[block.id])}
                      disabled={!responses[block.id]}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}
                    >
                      Submit Answer
                    </Button>
                  )}
                </div>
              )}

              {/* Identification / Enumeration */}
              {(block.question.question_type === 'identification' || block.question.question_type === 'enumeration') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Array.from({ length: block.question.question_type === 'enumeration' ? block.question.correct_answers.length : 1 }).map((_, i) => {
                    const ansList = responses[block.id] || [];
                    const isRevealed = revealed[block.id];
                    const val = ansList[i] || '';
                    
                    let isCorrect = false;
                    if (isRevealed) {
                      const allAnswersUpper = block.question!.correct_answers.map(a => a.toUpperCase());
                      isCorrect = allAnswersUpper.includes(val.toUpperCase());
                    }

                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          disabled={isRevealed}
                          style={{
                            flex: 1, padding: "12px 16px", borderRadius: 8,
                            border: isRevealed ? (isCorrect ? "2px solid #4CAF50" : "2px solid #F44336") : "1px solid var(--color-border)",
                            background: "var(--color-bg)", fontSize: 14, outline: "none",
                            color: isRevealed ? (isCorrect ? "#4CAF50" : "#F44336") : "var(--color-text)"
                          }}
                          placeholder="Type your answer..."
                          value={val}
                          onChange={(e) => {
                            const newAns = [...ansList];
                            newAns[i] = e.target.value;
                            setResponses({ ...responses, [block.id]: newAns });
                          }}
                        />
                        {isRevealed && (
                          isCorrect ? <CheckCircle size={20} color="#4CAF50" /> : <X size={20} color="#F44336" />
                        )}
                      </div>
                    );
                  })}

                  {revealed[block.id] && (
                    <div style={{ marginTop: 8, padding: 12, background: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid #4CAF50', borderRadius: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#4CAF50', textTransform: 'uppercase', marginBottom: 4 }}>Correct Answers</div>
                      <div style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600 }}>{block.question.correct_answers.join(", ")}</div>
                    </div>
                  )}

                  {!revealed[block.id] && (
                    <Button 
                      variant="primary" 
                      rounded="pill" 
                      onClick={() => saveResponse(block.id, responses[block.id] || [])}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}
                    >
                      Submit Answer
                    </Button>
                  )}
                </div>
              )}

              {/* Essay */}
              {block.question.question_type === 'essay' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    disabled={revealed[block.id]}
                    style={{
                      width: '100%', minHeight: 120, padding: 16, borderRadius: 8,
                      border: "1px solid var(--color-border)", background: "var(--color-bg)",
                      fontSize: 14, outline: "none", resize: 'vertical'
                    }}
                    placeholder="Write your answer..."
                    value={responses[block.id] || ''}
                    onChange={(e) => setResponses({ ...responses, [block.id]: e.target.value })}
                  />
                  {!revealed[block.id] && (
                    <Button 
                      variant="primary" 
                      rounded="pill" 
                      onClick={() => saveResponse(block.id, responses[block.id] || '')}
                      disabled={!responses[block.id]}
                      style={{ marginTop: 8, alignSelf: 'flex-start' }}
                    >
                      Submit Answer
                    </Button>
                  )}
                  {revealed[block.id] && (
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={16} color="#4CAF50" /> Answer saved for review.
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
