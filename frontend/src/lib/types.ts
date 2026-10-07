// TypeScript Definitions for Swathi College Exam Platform

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "EXAM_PAPER_CREATOR"
  | "EXAM_PAPER_EVALUATOR"
  | "EXAM_PAPER_CHECKER"
  | "TEACHER"
  | "STUDENT";

export type PermissionKey =
  | "CREATE_MAIN_PAPER"
  | "APPROVE_MAIN_PAPER"
  | "EVALUATE_MAIN_SHEETS"
  | "CHECK_MAIN_SHEETS"
  | "FINALIZE_MAIN_MARKS"
  | "CREATE_INTERNAL_PAPER"
  | "EVALUATE_INTERNAL_MARKS"
  | "MANAGE_EXAMS"
  | "MANAGE_USERS"
  | "MANAGE_FEES"
  | "ISSUE_HALL_TICKETS"
  | "PUBLISH_RESULTS"
  | "AUDIT_ACCESS";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  permissions?: string[];
  // Time-based access window properties
  isTimeRestricted?: boolean;
  timeWindowStart?: string | null;
  timeWindowEnd?: string | null;
  dailyStartTime?: string | null;
  dailyEndTime?: string | null;
  studentProfile?: {
    id: string;
    studentId: string;
    rollNo: string;
    admissionNo?: string | null;
    classId: string;
    className: string;
    sectionName: string;
    groupName?: string | null;
    fatherName?: string | null;
    dob?: string | null;
  } | null;
  teacherProfile?: {
    id: string;
    employeeId: string;
    designation: string;
    qualification?: string | null;
    department?: string | null;
  } | null;
}

export interface AcademicHierarchy {
  years: { id: string; name: string; isCurrent: boolean }[];
  classes: {
    id: string;
    name: string;
    code: string;
    sections: { id: string; name: string }[];
    groups: { id: string; name: string; code: string }[];
    subjects: { id: string; name: string; code: string; maxMarks: number; passMarks: number }[];
  }[];
}

export interface ExaminationDetail {
  id: string;
  examCode: string;
  title: string;
  examType: string;
  academicYear: string;
  className: string;
  sectionName?: string;
  groupName?: string;
  subjectName: string;
  subjectCode: string;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxMarks: number;
  passMarks: number;
  examMode: "OFFLINE" | "ONLINE";
  examFee: number;
  releaseLeadMinutes: number;
  releaseStatus: "SCHEDULED" | "RELEASED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  releasedAt?: string | null;
  instructions?: string | null;
  status: string;
  paper?: {
    id: string;
    title: string;
    version: number;
    fileUrl?: string | null;
    status: string;
    isReleased: boolean;
    questionsCount: number;
  } | null;
}

export interface HallTicketInfo {
  id: string;
  hallTicketNumber: string;
  studentName: string;
  studentId: string;
  rollNo: string;
  photoUrl?: string | null;
  className: string;
  sectionName: string;
  groupName?: string | null;
  fatherName?: string | null;
  centerName: string;
  roomNo?: string | null;
  seatNo?: string | null;
  examCode: string;
  examTitle: string;
  subjectName: string;
  examDate: string;
  examTime: string;
  duration: string;
  qrCodeData: string;
  status: string;
  feePaid: boolean;
  instructions: string[];
}

export interface AnswerSheetEvaluationView {
  id: string;
  sheetCode: string;
  examId: string;
  examTitle: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  student?: {
    id: string;
    name: string;
    rollNo: string;
    studentId: string;
    avatar?: string | null;
  } | null;
  totalPages: number;
  isMapped: boolean;
  mappingConfidence: number;
  evaluationStatus: "PENDING" | "AI_EVALUATED" | "UNDER_REVIEW" | "FINALIZED";
  aiTotalScore?: number | null;
  teacherTotalScore?: number | null;
  finalScore?: number | null;
  percentage?: number | null;
  grade?: string | null;
  pages: {
    id: string;
    pageNumber: number;
    imageUrl: string;
    ocrRawText?: string | null;
  }[];
  questions: {
    id: string;
    questionNumber: number;
    sectionName?: string | null;
    questionText: string;
    maxScore: number;
    rubricGuide?: string | null;
    modelAnswer?: string | null;
    aiSuggestedMarks?: number | null;
    aiConfidence?: number | null;
    aiFeedback?: string | null;
    teacherMarks?: number | null;
    teacherComment?: string | null;
    isOverridden: boolean;
    isVerified: boolean;
  }[];
}

export interface ScorecardResult {
  id: string;
  studentName: string;
  studentId: string;
  rollNo: string;
  fatherName?: string | null;
  className: string;
  sectionName: string;
  groupName?: string | null;
  academicYear: string;
  examTitle: string;
  examCode: string;
  subjectName: string;
  subjectCode: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number;
  percentage: number;
  gpa: number;
  grade: string;
  resultStatus: "PASS" | "FAIL" | "WITHHELD";
  isPublished: boolean;
  publishedAt?: string | null;
  qrVerificationData: string;
}
