/** Returns rating values from highest to lowest, e.g. [5,4,3,2,1] */
export function getScaleValues(part: { scale_min?: number; scale_max?: number }): number[] {
  const min = Math.floor(Number.isFinite(part.scale_min) ? (part.scale_min as number) : 1);
  let max = Math.floor(Number.isFinite(part.scale_max) ? (part.scale_max as number) : 5);
  if (max < min) max = min;
  const out: number[] = [];
  for (let v = max; v >= min; v--) out.push(v);
  return out;
}

export interface EvaluationScaleOption {
  value: number; // e.g. 5, 4, 3, 2, 1
  label: string; // e.g. "Strongly Agree", "Agree", etc.
}

export interface EvaluationStatement {
  id: string;
  number: number | string;
  text: string;
}

export interface EvaluationSection {
  id: string;
  letter: string; // e.g. "A", "B", "C", "D"
  title: string;
  statements: EvaluationStatement[];
}

export interface EvaluationFeedbackPrompt {
  id: string;
  number: number | string; // e.g. 15, 16, 17
  prompt: string;
}

export type EvaluationPartType = 'rating_scale' | 'open_feedback';

export interface EvaluationPart {
  id: string;
  part_number: string; // e.g. "Part I"
  title: string; // e.g. "Rating Scale"
  type: EvaluationPartType;
  instruction: string;
  scale_options?: EvaluationScaleOption[]; // legacy, unused
  scale_min?: number; // lowest rating, default 1
  scale_max?: number; // highest rating, default 5
  sections?: EvaluationSection[];
  feedback_questions?: EvaluationFeedbackPrompt[];
}

export interface EvaluationFormConfig {
  title?: string;
  description?: string;
  parts: EvaluationPart[];
  footer_message?: string;
}

export interface EvaluationAnswer {
  ratings: Record<string, number>; // key is statement id (or statement number/string), value is scale value (e.g. 1..5)
  feedback: Record<string, string>; // key is prompt id, value is answer text
}

export const DEFAULT_SCALE_OPTIONS: EvaluationScaleOption[] = [
  { value: 5, label: "Strongly Agree" },
  { value: 4, label: "Agree" },
  { value: 3, label: "Neutral" },
  { value: 2, label: "Disagree" },
  { value: 1, label: "Strongly Disagree" },
];

export function createDefaultEvaluationConfig(): EvaluationFormConfig {
  return {
    title: "Course Evaluation Form",
    description: "Please evaluate your learning experience to help us improve future CPD offerings.",
    parts: [
      {
        id: "part-1",
        part_number: "Part I",
        title: "Rating Scale",
        type: "rating_scale",
        instruction: "For each statement, tick (✓) the number that best describes your level of agreement.",
        scale_min: 1,
        scale_max: 5,
        sections: [
          {
            id: "sec-a",
            letter: "A",
            title: "Course Content and Learning",
            statements: [
              { id: "stmt-1", number: 1, text: "The learning objectives of the course were clearly presented." },
              { id: "stmt-2", number: 2, text: "The topics and lessons were relevant to my professional needs as a teacher." },
              { id: "stmt-3", number: 3, text: "The learning materials (readings, videos, and other resources) were clear and helpful." },
              { id: "stmt-4", number: 4, text: "The course provided practical strategies that I can apply in my teaching practice." },
            ],
          },
          {
            id: "sec-b",
            letter: "B",
            title: "Asynchronous Learning Activities",
            statements: [
              { id: "stmt-5", number: 5, text: "The instructions for each asynchronous activity were clear and easy to follow." },
              { id: "stmt-6", number: 6, text: "The activities were manageable within the allotted time." },
              { id: "stmt-7", number: 7, text: "The assessments and required outputs helped reinforce my learning." },
            ],
          },
          {
            id: "sec-c",
            letter: "C",
            title: "LMS Accessibility and Usability",
            statements: [
              { id: "stmt-8", number: 8, text: "The LMS was easy to access and navigate." },
              { id: "stmt-9", number: 9, text: "The videos, readings, and downloadable materials were accessible." },
              { id: "stmt-10", number: 10, text: "I was able to complete and submit assessments and required outputs without difficulty." },
              { id: "stmt-11", number: 11, text: "The LMS allowed me to learn at my own pace." },
            ],
          },
          {
            id: "sec-d",
            letter: "D",
            title: "Overall Learning Experience",
            statements: [
              { id: "stmt-12", number: 12, text: "The course met my learning expectations." },
              { id: "stmt-13", number: 13, text: "I am satisfied with my overall learning experience." },
              { id: "stmt-14", number: 14, text: "I would recommend this CPD course to other teachers." },
            ],
          },
        ],
      },
      {
        id: "part-2",
        part_number: "Part II",
        title: "Open-Ended Feedback",
        type: "open_feedback",
        instruction: "",
        feedback_questions: [
          { id: "fb-15", number: 15, prompt: "What was the most valuable learning or insight you gained from this course?" },
          { id: "fb-16", number: 16, prompt: "What improvements would you suggest for the course or LMS?" },
          { id: "fb-17", number: 17, prompt: "What other CPD topics would you like SPARK to offer in the future?" },
        ],
      },
    ],
    footer_message: "Thank you for completing this evaluation and for helping us improve SPARK CPD learning experiences.",
  };
}

export function parseEvaluationConfig(raw: any): EvaluationFormConfig {
  if (!raw) return createDefaultEvaluationConfig();
  if (Array.isArray(raw)) {
    if (raw.length === 0) return createDefaultEvaluationConfig();
    return parseEvaluationConfig(raw[0]);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed) return parseEvaluationConfig(parsed);
    } catch {
      return createDefaultEvaluationConfig();
    }
  }
  if (typeof raw === 'object') {
    if (Array.isArray(raw.parts)) return raw as EvaluationFormConfig;
    if (raw.evaluation_config) return parseEvaluationConfig(raw.evaluation_config);
    if (raw.config) return parseEvaluationConfig(raw.config);
  }
  return createDefaultEvaluationConfig();
}
