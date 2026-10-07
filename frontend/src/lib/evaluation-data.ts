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
  id: 'exam-medchem-2026',
  title: 'Semester End Examination — Medicinal Chemistry-II',
  subject: 'Medicinal Chemistry-II (BP501T)',
  subjectColor: '#0A6F34',
  classId: 'cls-001',
  className: 'B.Pharm V-Semester (Section A)',
  teacherId: 'tch-001',
  teacherName: 'Dr. K. S. Narayana',
  totalMarks: 75,
  duration: 180,
  date: '2026-10-15',
  status: 'EVALUATING',
  totalStudents: 60,
  evaluated: 12,
  pending: 48,
  avgScore: 54.5,
  avgScorePct: 72.6,
  sections: ['A', 'B', 'C'],
  resultsPublished: false,
};

// -----------------------------------------------------------------------------
// Sample Pharmacy Questions Blueprint
// -----------------------------------------------------------------------------
export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-001',
    section: 'A',
    sectionLabel: 'Objective & Multiple Choice',
    number: 1,
    type: 'MCQ',
    text: 'Which functional group is primarily responsible for the acidity and electrophilic substitution reactivity in paracetamol and salicylic acid?',
    options: [
      'A) Aliphatic amine group',
      'B) Carboxylic ester linkage',
      'C) Phenolic -OH group attached to aromatic nucleus',
      'D) Alkyl halogen substituent',
    ],
    correctAnswer: 'C',
    maxMarks: 1,
    negativeMark: 0,
    keywords: ['Phenolic OH', 'Aromatic nucleus', 'Resonance stabilization', 'Electrophilic substitution'],
    modelAnswer: 'Option (C): The phenolic hydroxyl group (-OH) has a lone pair on oxygen that delocalizes into the benzene ring via resonance (+M effect), activating the ring for ortho/para substitution.',
    markingBreakdown: [
      { marks: 1, description: 'Correct option (C) selected' },
    ],
    answerAreaBoundingBox: { pageNo: 1, top: 16, left: 10, width: 80, height: 7 },
  },
  {
    id: 'q-002',
    section: 'A',
    sectionLabel: 'Objective & Multiple Choice',
    number: 2,
    type: 'MCQ',
    text: 'Which cytochrome P450 isoenzyme is predominantly involved in the Phase-I oxidative biotransformation of over 50% of clinical pharmaceutical agents?',
    options: [
      'A) CYP2D6',
      'B) CYP3A4',
      'C) CYP1A2',
      'D) CYP2C19',
    ],
    correctAnswer: 'B',
    maxMarks: 1,
    negativeMark: 0,
    keywords: ['CYP3A4', 'Hepatic microsomes', 'Phase-I oxidation'],
    modelAnswer: 'Option (B): Cytochrome P450 3A4 (CYP3A4) is the most abundant hepatic and intestinal enzyme responsible for metabolizing the vast majority of therapeutic drugs.',
    markingBreakdown: [
      { marks: 1, description: 'Correct option (B) selected' },
    ],
    answerAreaBoundingBox: { pageNo: 1, top: 23, left: 10, width: 80, height: 7 },
  },
  {
    id: 'q-003',
    section: 'B',
    sectionLabel: 'Short Pharmaceutical Essays',
    number: 3,
    type: 'SHORT',
    text: 'Describe the chemical reaction mechanism for the laboratory synthesis of Aspirin (Acetylsalicylic Acid) from Salicylic Acid, including reagents, catalysts, and therapeutic applications.',
    options: null,
    correctAnswer: null,
    maxMarks: 5,
    negativeMark: 0,
    keywords: ['Salicylic acid', 'Acetic anhydride', 'Conc. H2SO4 catalyst', 'Esterification / Acetylation', 'Analgesic', 'Antiplatelet'],
    modelAnswer: 'Synthesis of Aspirin involves esterification (acetylation) of the phenolic -OH group of Salicylic acid with Acetic Anhydride in the presence of concentrated Sulphuric Acid catalyst at 50-60°C. C6H4(OH)COOH + (CH3CO)2O -> C6H4(OCOCH3)COOH + CH3COOH. Therapeutic applications include non-steroidal anti-inflammatory (NSAID), analgesic, antipyretic, and cardio-protective antiplatelet aggregation inhibitor.',
    markingBreakdown: [
      { marks: 1.5, description: 'Balanced chemical equation with correct structural names & formula' },
      { marks: 1.5, description: 'Reagents & conditions (Acetic anhydride, Conc. H2SO4 at 50-60°C)' },
      { marks: 1.0, description: 'Mechanism of esterification / acetylation explained' },
      { marks: 1.0, description: 'Therapeutic applications (NSAID, antiplatelet, analgesic)' },
    ],
    answerAreaBoundingBox: { pageNo: 1, top: 32, left: 10, width: 80, height: 26 },
  },
  {
    id: 'q-004',
    section: 'B',
    sectionLabel: 'Short Pharmaceutical Essays',
    number: 4,
    type: 'SHORT',
    text: 'Differentiate between Zero-Order and First-Order drug elimination kinetics with rate equations, graphical representations, and clinical examples.',
    options: null,
    correctAnswer: null,
    maxMarks: 5,
    negativeMark: 0,
    keywords: ['Zero-order kinetics', 'First-order kinetics', '-dC/dt = k0', '-dC/dt = k1*C', 'Constant amount vs fraction', 'Half-life t1/2'],
    modelAnswer: 'Zero-order kinetics: Rate of elimination is constant regardless of drug concentration (-dC/dt = k0). Constant amount is eliminated per unit time. Half-life depends on initial concentration. Examples: Phenytoin at toxic doses, Ethanol. First-order kinetics: Rate is directly proportional to plasma drug concentration (-dC/dt = k1*C). Constant fraction eliminated per unit time. Half-life is constant (t1/2 = 0.693/k1). Examples: Most drugs (Amoxicillin, Ciprofloxacin).',
    markingBreakdown: [
      { marks: 1.5, description: 'Rate equations & definition (constant amount vs fraction)' },
      { marks: 1.5, description: 'Half-life comparison & concentration dependency' },
      { marks: 1.0, description: 'Graphical curves / concentration-time slopes' },
      { marks: 1.0, description: 'Clinical drug examples for both orders' },
    ],
    answerAreaBoundingBox: { pageNo: 1, top: 58, left: 10, width: 80, height: 26 },
  },
  {
    id: 'q-005',
    section: 'C',
    sectionLabel: 'Detailed Pharmacological & Medicinal Chemistry Derivations',
    number: 5,
    type: 'LONG',
    text: 'Detail the Structure-Activity Relationship (SAR) of Penicillins (Beta-Lactam antibiotics). Explain how structural modifications at the C-6 acyl side chain alter acid stability and beta-lactamase resistance.',
    options: null,
    correctAnswer: null,
    maxMarks: 10,
    negativeMark: 0,
    keywords: ['Beta-lactam ring', 'Thiazolidine ring', 'C-3 Carboxylic acid', 'C-6 Acyl side chain', 'Transpeptidase inhibition', 'Penicillinase resistance'],
    modelAnswer: 'SAR of Penicillins: 1) Strained 4-membered beta-lactam ring fused to 5-membered thiazolidine ring is mandatory for bactericidal transpeptidase inhibition. 2) Free carboxylate at C-3 binds to lysine residue of PBP. 3) C-6 acyl side-chain modifications: Electron-withdrawing groups (e.g. NH2 in Ampicillin) prevent neighboring group attack on beta-lactam carbonyl giving acid stability for oral administration; Sterically hindered aromatic rings (e.g. 2,6-dimethoxyphenyl in Methicillin) block access of beta-lactamase enzyme giving penicillinase resistance.',
    markingBreakdown: [
      { marks: 2.5, description: 'Core bicyclic ring structure & transpeptidase binding sites' },
      { marks: 2.5, description: 'C-3 carboxylic group & stereochemistry' },
      { marks: 2.5, description: 'C-6 acyl modifications for acid resistance (Ampicillin/Amoxicillin)' },
      { marks: 2.5, description: 'C-6 steric hindrance for beta-lactamase resistance (Methicillin/Oxacillin)' },
    ],
    answerAreaBoundingBox: { pageNo: 2, top: 16, left: 10, width: 80, height: 35 },
  },
  {
    id: 'q-006',
    section: 'C',
    sectionLabel: 'Detailed Pharmacological & Medicinal Chemistry Derivations',
    number: 6,
    type: 'LONG',
    text: 'Discuss major industrial tablet manufacturing defects (Capping, Lamination, Sticking, Picking, Mottling, Weight Variation). State their root causes and formulating remedies.',
    options: null,
    correctAnswer: null,
    maxMarks: 10,
    negativeMark: 0,
    keywords: ['Capping', 'Lamination', 'Sticking', 'Picking', 'Mottling', 'Lubricants', 'Granule moisture', 'Pre-compression'],
    modelAnswer: 'Tablet defects: 1) Capping & Lamination: Separation of tablet crown/layers caused by air entrapment, excessive fines, or elastic recovery. Remediation: Pre-compression, slower punch speed, increase binder. 2) Sticking & Picking: Granules adhering to punch faces due to excess moisture or insufficient lubricant. Remediation: Proper drying, add 1-2% magnesium stearate or talc. 3) Mottling: Unequal color distribution from dye migration. Remediation: Use lake pigments, change solvent. 4) Weight variation: Poor flowability or uneven die filling. Remediation: Improve glidants (Colloidal silica), ensure uniform particle size.',
    markingBreakdown: [
      { marks: 2.5, description: 'Capping & Lamination causes & formulating remedies' },
      { marks: 2.5, description: 'Sticking & Picking causes & lubricant corrections' },
      { marks: 2.5, description: 'Mottling & Color migration solutions' },
      { marks: 2.5, description: 'Weight variation & Granule flowability controls' },
    ],
    answerAreaBoundingBox: { pageNo: 2, top: 44, left: 10, width: 80, height: 35 },
  },
];

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
