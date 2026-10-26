import { apiClient } from "./client";

// Auth
export const login = async (credentials: { email: string; password: string }) => {
  const res = await apiClient.post("/auth/login", credentials);
  return res.data;
};

export const getMe = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

export const logout = async () => {
  const res = await apiClient.post("/auth/logout");
  return res.data;
};

export const switchRole = async (role: string) => {
  const res = await apiClient.post("/auth/switch-role", { role });
  return res.data;
};

// Academic Hierarchy & Master Data
export const getAcademicHierarchy = async () => {
  const res = await apiClient.get("/academic");
  return res.data;
};

export const createProgram = async (payload: { name: string; code: string; description?: string; duration?: number }) => {
  const res = await apiClient.post("/academic/programs", payload);
  return res.data;
};

export const updateProgram = async (id: string, payload: { name?: string; code?: string; description?: string; duration?: number }) => {
  const res = await apiClient.put(`/academic/programs/${id}`, payload);
  return res.data;
};

export const createClass = async (payload: any) => {
  const res = await apiClient.post("/academic/classes", payload);
  return res.data;
};

export const updateClass = async (id: string, payload: { name?: string; code?: string }) => {
  const res = await apiClient.put(`/academic/classes/${id}`, payload);
  return res.data;
};

export const createSection = async (payload: { name: string; classId: string }) => {
  const res = await apiClient.post("/academic/sections", payload);
  return res.data;
};

export const updateSection = async (id: string, payload: { name?: string }) => {
  const res = await apiClient.put(`/academic/sections/${id}`, payload);
  return res.data;
};

export const bulkImportClasses = async (payload: any) => {
  const res = await apiClient.post("/academic/classes/bulk", payload);
  return res.data;
};

export const getSubjects = async (classId?: string) => {
  const res = await apiClient.get("/academic/subjects", { params: { classId } });
  return res.data;
};

export const createSubject = async (payload: any) => {
  const res = await apiClient.post("/academic/subjects", payload);
  return res.data;
};

export const deleteSubject = async (id: string) => {
  const res = await apiClient.delete(`/academic/subjects/${id}`);
  return res.data;
};

export const deleteTeacherAssignment = async (id: string) => {
  const res = await apiClient.delete(`/academic/subjects/assign-teacher?id=${id}`);
  return res.data;
};

// Exams
export const getExams = async (params?: { classId?: string }) => {
  const res = await apiClient.get("/exams", { params });
  return res.data;
};

export const getExamById = async (id: string) => {
  const res = await apiClient.get(`/exams/${id}`);
  return res.data;
};

export const createExam = async (payload: any) => {
  const res = await apiClient.post("/exams/create", payload);
  return res.data;
};

export const updateExam = async (id: string, payload: any) => {
  const res = await apiClient.put(`/exams/${id}`, payload);
  return res.data;
};

export const getPaperVault = async () => {
  const res = await apiClient.get("/exams/papers/vault");
  return res.data;
};

export const togglePaperRelease = async (payload: { paperId?: string; examId?: string; release: boolean }) => {
  const res = await apiClient.post("/exams/papers/release", payload);
  return res.data;
};

// Evaluation
export const getEvaluationQueue = async () => {
  const res = await apiClient.get("/evaluation/queue");
  return res.data;
};

export const getAnswerSheet = async (id: string) => {
  const res = await apiClient.get(`/evaluation/${id}`);
  return res.data;
};

export const submitEvaluation = async (payload: any) => {
  const res = await apiClient.post("/evaluation/submit", payload);
  return res.data;
};

export const evaluateWithAI = async (payload: any) => {
  const res = await apiClient.post("/evaluation/ai-evaluate", payload);
  return res.data;
};

export const requestRevaluation = async (payload: { answerSheetId: string; reason: string }) => {
  const res = await apiClient.post("/evaluation/revaluation", payload);
  return res.data;
};

export const getBundles = async () => {
  const res = await apiClient.get("/evaluation/bundles/all");
  return res.data;
};

export const getSheets = async (params?: any) => {
  const res = await apiClient.get("/evaluation/sheets", { params });
  return res.data;
};

export const overrideEvaluation = async (id: string, payload: any) => {
  const res = await apiClient.post(`/evaluation/${id}/override`, payload);
  return res.data;
};

export const checkEvaluationStatus = async (params?: any) => {
  const res = await apiClient.get("/evaluation/check", { params });
  return res.data;
};


// AI Scan
export const scanQuestionPaper = async (payload: any) => {
  const res = await apiClient.post("/ai/scan-question-paper", payload);
  return res.data;
};

export const evaluateScript = async (payload: any) => {
  const res = await apiClient.post("/ai/evaluate-script", payload);
  return res.data;
};


// Fees
export const getFees = async () => {
  const res = await apiClient.get("/fees");
  return res.data;
};

export const getStudentFees = async () => {
  const res = await apiClient.get("/users/student/fees");
  return res.data;
};

export const payFee = async (payload: { paymentId?: string; examId?: string; paymentMethod?: string; amount?: number }) => {
  const res = await apiClient.post("/fees/pay", payload);
  return res.data;
};

export const deleteFee = async (id: string) => {
  const res = await apiClient.delete(`/fees/${id}`);
  return res.data;
};

// Hall Tickets
export const getHallTickets = async () => {
  const res = await apiClient.get("/hall-tickets");
  return res.data;
};

export const getStudentHallTickets = async () => {
  const res = await apiClient.get("/users/student/hall-tickets");
  return res.data;
};

export const verifyHallTicket = async (ticketNumber: string) => {
  const res = await apiClient.get(`/hall-tickets/verify/${ticketNumber}`);
  return res.data;
};

// Results
export const getResults = async () => {
  const res = await apiClient.get("/results");
  return res.data;
};

export const publishResults = async (payload: { examId: string; publish: boolean }) => {
  const res = await apiClient.post("/results/publish", payload);
  return res.data;
};

// Dashboard Stats (Calculated entirely on Backend)
export const getDashboardStats = async () => {
  const res = await apiClient.get("/users/stats/dashboard");
  return res.data;
};

// Users
export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  classId?: string;
}) => {
  const res = await apiClient.get("/users", { params });
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
};

export const getMyProfile = async () => {
  const res = await apiClient.get("/users/profile/me");
  return res.data;
};

export const updateMyProfile = async (payload: any) => {
  const res = await apiClient.put("/users/profile/me", payload);
  return res.data;
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
  const res = await apiClient.post("/users/change-password", payload);
  return res.data;
};

export const onboardUser = async (payload: any) => {
  const res = await apiClient.post("/users/onboard", payload);
  return res.data;
};

export const bulkOnboardUsers = async (payload: any) => {
  const res = await apiClient.post("/users/bulk-onboard", payload);
  return res.data;
};

export const updateUserRole = async (payload: any) => {
  const res = await apiClient.post("/users/update-role", payload);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
};

// Audit
export const getAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  action?: string;
  entity?: string;
  search?: string;
  userId?: string;
}) => {
  const res = await apiClient.get("/audit", { params });
  return res.data;
};

export const getAuditSummary = async () => {
  const res = await apiClient.get("/audit/summary");
  return res.data;
};

export const getMyAuditLogs = async () => {
  const res = await apiClient.get("/audit/my-logs");
  return res.data;
};

// --- Aliases for compatibility with old queries ---
export const getHierarchy = getAcademicHierarchy;
export const getQueue = getEvaluationQueue;
export const getAnswerSheetById = getAnswerSheet;
export const verifyTicket = verifyHallTicket;
export const bulkOnboard = bulkOnboardUsers;
export const updateRole = updateUserRole;
export const getLogs = getAuditLogs;
export const ingestSheets = getSheets;
export const overrideMarks = overrideEvaluation;

export const updateSubject = async (payload: any) => (await apiClient.post("/academic/subjects/update", payload)).data;
export const mapSubjectToClasses = async (payload: any) => (await apiClient.post("/academic/subjects/map-classes", payload)).data;
export const assignTeacher = async (payload: any) => (await apiClient.post("/academic/subjects/assign-teacher", payload)).data;
export const deleteEntity = async (type: string, id: string) => (await apiClient.post(`/academic/delete`, { type, id })).data;
export const deleteExam = async (id: string) => (await apiClient.delete(`/exams/${id}`)).data;
export const getFeeById = async (id: string) => (await apiClient.get(`/fees/${id}`)).data;
export const checkModeration = async (payload?: any) => (await apiClient.post("/evaluation/check", payload)).data;
export const createBundle = async (payload: any) => (await apiClient.post("/evaluation/bundles", payload)).data;
export const deleteBundle = async (id: string) => (await apiClient.delete(`/evaluation/bundles/${id}`)).data;
export const deleteAnswerSheet = async (id: string) => (await apiClient.delete(`/evaluation/${id}`)).data;
export const submitPaper = async (paperId: string) => (await apiClient.post("/exams/papers/submit", { paperId })).data;
