// CSV Template generator and downloader for Swathi College Pharmacy Onboarding

export interface TemplateField {
  header: string;
  description: string;
  example: string;
  required: boolean;
}

export const ADMIN_TEMPLATE_FIELDS: TemplateField[] = [
  { header: "Name", description: "Full Name with prefix", example: "Dr. K. S. Narayana", required: true },
  { header: "Email", description: "Institutional Email", example: "exam.controller2@swathicollege.edu", required: true },
  { header: "Role", description: "ADMIN or SUPER_ADMIN", example: "ADMIN", required: true },
  { header: "Phone", description: "10-digit mobile number", example: "+91 98480 23456", required: false },
  { header: "Designation", description: "Official Title", example: "Assistant Exam Controller", required: false },
  { header: "Password", description: "Initial login password (optional, defaults to Welcome@123)", example: "Admin@2026", required: false },
];

export const TEACHER_TEMPLATE_FIELDS: TemplateField[] = [
  { header: "Name", description: "Faculty Full Name", example: "Dr. P. S. Rao", required: true },
  { header: "Email", description: "Official Faculty Email", example: "dr.psrao@swathicollege.edu", required: true },
  { header: "EmployeeId", description: "Unique Institutional Employee ID", example: "FAC-PHA-101", required: true },
  { header: "Department", description: "Pharmaceutics, Pharmacology, Pharmaceutical Chemistry, Pharmacognosy, Pharmacy Practice, Pharmaceutical Analysis", example: "Pharmaceutics", required: true },
  { header: "Designation", description: "Professor, Associate Professor, Assistant Professor, HOD", example: "Professor & HOD", required: true },
  { header: "Qualification", description: "Degrees and Specialization", example: "M.Pharm, Ph.D in Pharmaceutics", required: false },
  { header: "Phone", description: "10-digit mobile number", example: "+91 98480 34567", required: false },
  { header: "Password", description: "Initial password (defaults to Faculty@123)", example: "Teacher@2026", required: false },
];

export const STUDENT_TEMPLATE_FIELDS: TemplateField[] = [
  { header: "Name", description: "Student Full Name", example: "A. Bhavani", required: true },
  { header: "Email", description: "Student Email Address", example: "bhavani.a@student.swathi.edu", required: true },
  { header: "RollNo", description: "University Exam Roll Number / Hall Ticket Number", example: "26BPH101", required: true },
  { header: "StudentId", description: "Unique College Student ID", example: "SWC-2026-BPH-001", required: true },
  { header: "AdmissionNo", description: "Admission Registration Number", example: "ADM-2026-001", required: false },
  { header: "ClassCode", description: "Class/Program Code (e.g. BPHARM-1, BPHARM-2, BPHARM-3, BPHARM-4, MPHARM-P1, PHARMD-1, DPHARM-1)", example: "BPHARM-1", required: true },
  { header: "SectionName", description: "Section name (e.g. Section A, Section B)", example: "Section A", required: true },
  { header: "AcademicYear", description: "Academic session (e.g. 2026-2027)", example: "2026-2027", required: true },
  { header: "FatherName", description: "Father / Guardian Name", example: "A. Venkat Rao", required: false },
  { header: "Phone", description: "Contact number", example: "+91 99887 76651", required: false },
  { header: "Gender", description: "Male / Female / Other", example: "Female", required: false },
  { header: "DOB", description: "YYYY-MM-DD", example: "2005-08-14", required: false },
  { header: "Password", description: "Initial password (defaults to Student@123)", example: "Student@2026", required: false },
];

export function generateCsvTemplate(type: "admin" | "teacher" | "student"): string {
  let fields: TemplateField[];
  let sampleRows: string[][];

  if (type === "admin") {
    fields = ADMIN_TEMPLATE_FIELDS;
    sampleRows = [
      ["Dr. K. S. Narayana", "admin@swathicollege.edu", "SUPER_ADMIN", "+91 98480 12345", "Principal & Chief Superintendent", "Admin@123"],
      ["M. Venkat Rao", "controller@swathicollege.edu", "ADMIN", "+91 98480 23456", "Controller of Examinations", "Admin@123"],
      ["S. Lakshmi", "lakshmi.admin@swathicollege.edu", "ADMIN", "+91 98480 34567", "Assistant Exam Controller", "Admin@123"],
    ];
  } else if (type === "teacher") {
    fields = TEACHER_TEMPLATE_FIELDS;
    sampleRows = [
      ["Prof. Ramesh Kumar", "prof.ramesh@swathicollege.edu", "FAC-PHA-01", "Pharmaceutics", "Professor & HOD", "M.Pharm, Ph.D", "+91 98480 55112", "Teacher@123"],
      ["Dr. Anita Sharma", "anita.sharma@swathicollege.edu", "FAC-PCL-02", "Pharmacology", "Associate Professor", "Ph.D in Pharmacology", "+91 98480 55113", "Teacher@123"],
      ["Dr. V. Prasad", "prasad.v@swathicollege.edu", "FAC-PCH-03", "Pharmaceutical Chemistry", "Associate Professor", "M.Pharm, Ph.D", "+91 98480 55114", "Teacher@123"],
      ["Dr. Sunitha Reddy", "sunitha.r@swathicollege.edu", "FAC-PPR-04", "Pharmacy Practice", "Assistant Professor", "Pharm.D", "+91 98480 55115", "Teacher@123"],
    ];
  } else {
    fields = STUDENT_TEMPLATE_FIELDS;
    sampleRows = [
      ["Rahul Sharma", "rahul.sharma@student.swathi.edu", "26BPH001", "SWC-2026-BPH-001", "ADM-2026-081", "BPHARM-1", "Section A", "2026-2027", "Sanjay Sharma", "+91 99887 76651", "Male", "2006-04-12", "Student@123"],
      ["Sneha Reddy", "sneha.reddy@student.swathi.edu", "26BPH002", "SWC-2026-BPH-002", "ADM-2026-082", "BPHARM-1", "Section A", "2026-2027", "K. R. Reddy", "+91 99887 76652", "Female", "2006-07-25", "Student@123"],
      ["Vikas Varma", "vikas.varma@student.swathi.edu", "26BPH003", "SWC-2026-BPH-003", "ADM-2026-083", "BPHARM-1", "Section B", "2026-2027", "V. R. Varma", "+91 99887 76653", "Male", "2005-11-18", "Student@123"],
      ["Pooja Patel", "pooja.patel@student.swathi.edu", "26PHD001", "SWC-2026-PHD-001", "ADM-2026-101", "PHARMD-1", "Section A", "2026-2027", "Dinesh Patel", "+91 99887 76654", "Female", "2006-02-09", "Student@123"],
    ];
  }

  const headers = fields.map((f) => f.header).join(",");
  const rows = sampleRows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");

  return `${headers}\n${rows}`;
}

export function downloadCsvFile(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
