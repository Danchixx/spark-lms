import { Play, ArrowRight } from "lucide-react";
import Button from "../Button/Button";
import "./LessonCard.css";

const LessonCard = ({ lesson, onBack, onNext, currentIndex, totalLessons, onProceedAssessment }) => {
  if (!lesson) return null;

  return (
    <div className="lesson-card-wrapper">
      <h2 className="lesson-card-title">{lesson.title?.replace(/^(Video:|Reading:|Assessment:)\s*/, '')}</h2>

      {lesson.type === "video" && (
        <>
          <div className="lesson-video-player">
            <div className="lesson-video-play-btn">
              <Play size={28} color="white" fill="white" style={{ marginLeft: 4 }} />
            </div>
            <div className="lesson-video-subtitle">Intro Video · 4:32</div>
          </div>
          <div className="lesson-video-controls">
            <Play size={16} color="#1a1a1a" fill="#1a1a1a" />
            <div className="lesson-video-track">
              <div className="lesson-video-progress">
                <div className="lesson-video-thumb" />
              </div>
            </div>
            <div className="lesson-video-time">1:53 / 4:32</div>
          </div>
        </>
      )}

      <div className="lesson-content-body">
        <h3>What is AIDA Model?</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        
        <h3>Lorem Ipsum</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      {lesson.type === "assessment" && (
        <div style={{
          background: "linear-gradient(90deg, #ffeed3, #ffd2ae)",
          borderRadius: 8,
          border: "1px solid #ffb27f",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 24,
          boxShadow: "0 4px 12px rgba(255, 107, 0, 0.15)"
        }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Unit Assessment: Test Your Knowledge</h3>
            <div style={{ fontSize: 13, color: "#666", fontWeight: "500" }}>Pass this exam to continue with your learning chapter</div>
          </div>
          <Button variant="primary" rounded="pill" rightIcon={<ArrowRight size={16} />} onClick={onProceedAssessment} style={{ fontWeight: "600", padding: "8px 24px" }}>
            Proceed
          </Button>
        </div>
      )}

      <div className="lesson-card-footer">
        <Button 
          variant="outline" 
          rounded="pill" 
          onClick={onBack} 
          disabled={currentIndex <= 1}
          style={{ width: 100, justifyContent: "center", visibility: currentIndex <= 1 ? "hidden" : "visible" }}
        >
          Back
        </Button>
        
        <div className="lesson-step-indicator">
          Lesson {currentIndex} of {totalLessons}
        </div>
        
        {currentIndex < totalLessons ? (
          <Button 
            variant="primary" 
            rounded="pill" 
            onClick={onNext}
            style={{ width: 100, justifyContent: "center" }}
          >
            Next
          </Button>
        ) : (
          <div style={{ width: 100 }}></div>
        )}
      </div>
    </div>
  );
};

export default LessonCard;
