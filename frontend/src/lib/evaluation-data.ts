export interface MarkingBreakdownStep {
  marks: number;
  description: string;
}

export interface Question {
  id: string;
  section: string;
  sectionLabel: string;
  number: number;
  type: 'MCQ' | 'SHORT' | 'LONG';
  text: string;
  options: string[] | null;
  correctAnswer: string | null;
  maxMarks: number;
  negativeMark: number;
  keywords: string[];
  modelAnswer: string;
  markingBreakdown?: MarkingBreakdownStep[];
  answerAreaBoundingBox?: {
    pageNo: number;
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface SheetPage {
  pageNo: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  ocrText: string;
  rotation?: number;
}

export interface AIEvaluationAnswer {
  questionId: string;
  questionNo: number;
  studentAnswer: string;
  aiSuggestedMarks: number;
  maxMarks: number;
  confidence: number;
  aiComment: string;
  keywordsFound: string[];
  keywordsMissed: string[];
  teacherMarks: number | null;
  teacherComment?: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'OVERRIDDEN';
}

export interface AIEvaluationResult {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE';
  answers: AIEvaluationAnswer[];
  totalAISuggestedMarks: number;
  totalMaxMarks: number;
  aiSuggestedPercentage: number;
}

export interface PaperAnnotation {
  id: string;
  pageNo: number;
  type: 'CHECK' | 'CROSS' | 'BOX' | 'TEXT' | 'MARKS';
  x: number;
  y: number;
  text?: string;
  color?: string;
}

export interface AnswerSheet {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  studentColor: string;
  rollNo: string;
  className: string;
  status: 'NOT_UPLOADED' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'PENDING_MANUAL' | 'EVALUATED' | 'ABSENT';
  uploadedAt: string | null;
  evaluatedAt?: string | null;
  evaluatedBy?: string | null;
  totalMarks?: number;
  totalMaxMarks?: number;
  percentage?: number;
  passed?: boolean;
  pages: SheetPage[];
  currentPage?: number;
  aiEvaluation: AIEvaluationResult;
  marksEntered?: Record<string, number>;
  commentsEntered?: Record<string, string>;
  stepBreakdownChecked?: Record<string, Record<number, boolean>>;
  annotations?: PaperAnnotation[];
  revaluationRequested?: boolean;
  revaluationNote?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  totalMarks: number;
  duration: number;
  date: string;
  status: 'DRAFT' | 'UPLOADING' | 'EVALUATING' | 'COMPLETED' | 'PUBLISHED';
  totalStudents: number;
  evaluated: number;
  pending: number;
  avgScore: number;
  avgScorePct: number;
  sections: string[];
  questionPaperUrl?: string | null;
  resultsPublished?: boolean;
}

export const INITIAL_EXAM: Exam = {
  id: '',
  title: 'Semester End Examination',
  subject: '',
  subjectColor: '#0A6F34',
  classId: '',
  className: '',
  teacherId: '',
  teacherName: 'Dr. K. S. Narayana',
  totalMarks: 100,
  duration: 180,
  date: new Date().toISOString().split('T')[0],
  status: 'DRAFT',
  totalStudents: 0,
  evaluated: 0,
  pending: 0,
  avgScore: 0,
  avgScorePct: 0,
  sections: [],
  resultsPublished: false,
};

// -----------------------------------------------------------------------------
// Questions Blueprint (Loaded from database)
// -----------------------------------------------------------------------------
export const INITIAL_QUESTIONS: Question[] = [];


// -----------------------------------------------------------------------------
// Initial Answer Sheets (Empty by default - real student uploads will populate here)
// -----------------------------------------------------------------------------
export const INITIAL_SHEETS: AnswerSheet[] = [];

// -----------------------------------------------------------------------------
// Storage and Helper Functions (Local Storage & In-Memory Sync)
// -----------------------------------------------------------------------------
const STORAGE_KEYS = {
  QUESTIONS: 'swathi_eval_questions',
  SHEETS: 'swathi_eval_sheets',
  EXAMS: 'swathi_eval_exams',
};

export function getStoredExam(): Partial<Exam> {
  if (typeof window === 'undefined') return INITIAL_EXAM;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return data ? JSON.parse(data) : INITIAL_EXAM;
  } catch {
    return INITIAL_EXAM;
  }
}

export function saveStoredExam(exam: Exam): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exam));
  } catch (err) {
    console.error('Failed to save stored exam:', err);
  }
}

export function getExamById(id: string): Exam {
  const current = getStoredExam();
  if (current.id === id) return current as Exam;
  return {
    ...INITIAL_EXAM,
    id,
    title: current.title || INITIAL_EXAM.title,
  } as Exam;
}

export function getStoredQuestions(): Question[] {
  if (typeof window === 'undefined') return INITIAL_QUESTIONS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return data ? JSON.parse(data) : INITIAL_QUESTIONS;
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: Question[], examId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    if (examId) {
      localStorage.setItem(`${STORAGE_KEYS.QUESTIONS}_${examId}`, JSON.stringify(questions));
    }
  } catch (err) {
    console.error('Failed to save stored questions:', err);
  }
}

export function saveStoredSheets(sheets: AnswerSheet[], examId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(sheets));
    if (examId) {
      localStorage.setItem(`${STORAGE_KEYS.SHEETS}_${examId}`, JSON.stringify(sheets));
    }
  } catch (err) {
    console.error('Failed to save stored sheets:', err);
  }
}

export function getStoredSheets(): AnswerSheet[] {
  if (typeof window === 'undefined') return INITIAL_SHEETS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHEETS);
    return data ? JSON.parse(data) : INITIAL_SHEETS;
  } catch {
    return INITIAL_SHEETS;
  }
}

export function getSheetById(sheetId: string): AnswerSheet | undefined {
  const sheets = getStoredSheets();
  return sheets.find((s) => s.id === sheetId) || sheets[0];
}

export function updateSheetMarks(
  sheetId: string,
  marksEntered: Record<string, number>,
  commentsEntered: Record<string, string>,
  stepBreakdownChecked: Record<string, Record<number, boolean>>,
  annotations: PaperAnnotation[],
  markAsFinal: boolean = false
): void {
  if (typeof window === 'undefined') return;
  try {
    const sheets = getStoredSheets();
    const updated = sheets.map((sheet) => {
      if (sheet.id === sheetId) {
        const totalMarks = Object.values(marksEntered).reduce((sum, v) => sum + (Number(v) || 0), 0);
        const totalMaxMarks = 32;
        const percentage = Math.round((totalMarks / totalMaxMarks) * 100);
        return {
          ...sheet,
          marksEntered,
          commentsEntered,
          stepBreakdownChecked,
          annotations,
          totalMarks,
          totalMaxMarks,
          percentage,
          passed: percentage >= 50,
          status: (markAsFinal ? 'EVALUATED' : 'READY') as AnswerSheet['status'],
          evaluatedAt: markAsFinal ? new Date().toISOString() : sheet.evaluatedAt,
        };
      }
      return sheet;
    });
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update sheet marks:', err);
  }
}

export function setSheetPages(sheetId: string, pages: SheetPage[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sheets = getStoredSheets();
    const updated = sheets.map((sheet) => {
      if (sheet.id === sheetId) {
        return { ...sheet, pages };
      }
      return sheet;
    });
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to set sheet pages:', err);
  }
}
