// Seed script for Swathi College of Pharmacy Examination Platform
// Synced with official portal https://pharmacy.swathicolleges.ac.in/
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed for Swathi College of Pharmacy...");

  // 1. Clean existing records in strict foreign-key dependency order
  await prisma.aiEvaluationLog.deleteMany();
  await prisma.questionEvaluation.deleteMany();
  await prisma.answerSheetPage.deleteMany();
  await prisma.answerSheet.deleteMany();
  await prisma.answerSheetBundle.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.hallTicket.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.questionItem.deleteMany();
  await prisma.paperVersionHistory.deleteMany();
  await prisma.examPaper.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.group.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Cleared existing records");

  // 2. Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2026-2027",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-05-31"),
      isCurrent: true,
    },
  });

  // 3. Classes / Programs (Official from pharmacy.swathicolleges.ac.in)
  const bpharm1 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - 1st Year",
      code: "BPHARM-1",
      description: "Bachelor of Pharmacy 1st Year (Sem I & II)",
    },
  });

  const bpharm2 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - 2nd Year",
      code: "BPHARM-2",
      description: "Bachelor of Pharmacy 2nd Year (Sem III & IV)",
    },
  });

  const bpharm3 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - 3rd Year",
      code: "BPHARM-3",
      description: "Bachelor of Pharmacy 3rd Year (Sem V & VI)",
    },
  });

  const bpharm4 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - Final Year",
      code: "BPHARM-4",
      description: "Bachelor of Pharmacy 4th Year (Sem VII & VIII)",
    },
  });

  const mpharmP = await prisma.class.create({
    data: {
      name: "M.Pharmacy (Pharmaceutics)",
      code: "MPHARM-P1",
      description: "Master of Pharmacy - Pharmaceutics Division",
    },
  });

  const mpharmPP = await prisma.class.create({
    data: {
      name: "M.Pharmacy (Pharmacy Practice)",
      code: "MPHARM-PP1",
      description: "Master of Pharmacy - Pharmacy Practice Division",
    },
  });

  const pharmD = await prisma.class.create({
    data: {
      name: "Pharm.D (Doctor of Pharmacy)",
      code: "PHARMD-1",
      description: "Doctor of Pharmacy 6-Year Professional Program",
    },
  });

  const dpharm = await prisma.class.create({
    data: {
      name: "D.Pharmacy (Diploma in Pharmacy)",
      code: "DPHARM-1",
      description: "Diploma in Pharmacy 2-Year Program",
    },
  });

  // 4. Sections
  const secA = await prisma.section.create({
    data: { name: "Section A", classId: bpharm1.id },
  });
  const secB = await prisma.section.create({
    data: { name: "Section B", classId: bpharm1.id },
  });

  await prisma.section.create({ data: { name: "Section A", classId: bpharm2.id } });
  await prisma.section.create({ data: { name: "Section A", classId: bpharm3.id } });
  await prisma.section.create({ data: { name: "Section A", classId: bpharm4.id } });
  await prisma.section.create({ data: { name: "Section A", classId: mpharmP.id } });
  await prisma.section.create({ data: { name: "Section A", classId: mpharmPP.id } });
  await prisma.section.create({ data: { name: "Section A", classId: pharmD.id } });
  await prisma.section.create({ data: { name: "Section A", classId: dpharm.id } });

  // 5. Subjects for B.Pharmacy
  const subPharmaceutics = await prisma.subject.create({
    data: {
      name: "Pharmaceutics - I (Theory & Formulation)",
      code: "BP103T",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subAnatomy = await prisma.subject.create({
    data: {
      name: "Human Anatomy and Physiology - I",
      code: "BP101T",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subAnalysis = await prisma.subject.create({
    data: {
      name: "Pharmaceutical Analysis - I",
      code: "BP102T",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subChem = await prisma.subject.create({
    data: {
      name: "Pharmaceutical Inorganic Chemistry",
      code: "BP104T",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  console.log("✓ Created Swathi College of Pharmacy Academic Hierarchy");

  // 6. Hash Passwords
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const teacherHash = await bcrypt.hash("Teacher@123", 10);
  const studentHash = await bcrypt.hash("Student@123", 10);

  // Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      name: "Dr. K. S. Narayana",
      email: "admin@swathicollege.edu",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      phone: "+91 98480 12345",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      isTimeRestricted: false,
      permissions: JSON.stringify([
        "CREATE_MAIN_PAPER",
        "APPROVE_MAIN_PAPER",
        "EVALUATE_MAIN_SHEETS",
        "FINALIZE_MAIN_MARKS",
        "CREATE_INTERNAL_PAPER",
        "EVALUATE_INTERNAL_MARKS",
        "MANAGE_EXAMS",
        "MANAGE_USERS",
        "MANAGE_FEES",
        "ISSUE_HALL_TICKETS",
        "PUBLISH_RESULTS",
        "AUDIT_ACCESS",
      ]),
    },
  });

  // Admin / Exam Controller
  const adminUser = await prisma.user.create({
    data: {
      name: "M. Venkat Rao (Exam Controller)",
      email: "exam.controller@swathicollege.edu",
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "+91 98480 23456",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isTimeRestricted: false,
      permissions: JSON.stringify([
        "MANAGE_EXAMS",
        "APPROVE_MAIN_PAPER",
        "MANAGE_FEES",
        "ISSUE_HALL_TICKETS",
        "PUBLISH_RESULTS",
        "AUDIT_ACCESS",
      ]),
    },
  });

  // Exam Paper Creator (New Dedicated Role with Scheduled Time Window)
  const paperCreatorUser = await prisma.user.create({
    data: {
      name: "Dr. S. K. Verma (Paper Creator)",
      email: "creator@swathicollege.edu",
      passwordHash: adminHash,
      role: "EXAM_PAPER_CREATOR",
      phone: "+91 98480 77889",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      isTimeRestricted: true,
      timeWindowStart: new Date("2026-06-01"),
      timeWindowEnd: new Date("2027-05-31"),
      dailyStartTime: "08:00",
      dailyEndTime: "20:00",
      permissions: JSON.stringify([
        "CREATE_MAIN_PAPER",
        "APPROVE_MAIN_PAPER",
      ]),
    },
  });

  // Exam Paper Evaluator (New Dedicated Role with Scheduled Time Window)
  const paperEvaluatorUser = await prisma.user.create({
    data: {
      name: "Dr. Sunita Deshmukh (Chief Evaluator)",
      email: "evaluator@swathicollege.edu",
      passwordHash: adminHash,
      role: "EXAM_PAPER_EVALUATOR",
      phone: "+91 98480 66778",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      isTimeRestricted: true,
      timeWindowStart: new Date("2026-06-01"),
      timeWindowEnd: new Date("2027-05-31"),
      dailyStartTime: "08:00",
      dailyEndTime: "20:00",
      permissions: JSON.stringify([
        "EVALUATE_MAIN_SHEETS",
      ]),
    },
  });

  // Exam Paper Checker / Reviewer (New Role: 2nd stage scrutiny after evaluator)
  const paperCheckerUser = await prisma.user.create({
    data: {
      name: "Dr. P. V. Ramana (Senior Paper Checker)",
      email: "checker@swathicollege.edu",
      passwordHash: adminHash,
      role: "EXAM_PAPER_CHECKER",
      phone: "+91 98480 88990",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
      isTimeRestricted: true,
      timeWindowStart: new Date("2026-06-01"),
      timeWindowEnd: new Date("2027-05-31"),
      dailyStartTime: "08:00",
      dailyEndTime: "20:00",
      permissions: JSON.stringify([
        "CHECK_MAIN_SHEETS",
        "FINALIZE_MAIN_MARKS",
      ]),
    },
  });

  // Faculty Members (Restricted to Internal Papers & Internal Continuous Assessment)
  const teacherPharmaceutics = await prisma.user.create({
    data: {
      name: "Prof. Ramesh Kumar",
      email: "prof.ramesh@swathicollege.edu",
      passwordHash: teacherHash,
      role: "TEACHER",
      phone: "+91 98480 34567",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      permissions: JSON.stringify([
        "CREATE_INTERNAL_PAPER",
        "EVALUATE_INTERNAL_MARKS",
      ]),
      teacherProfile: {
        create: {
          employeeId: "FAC-PHA-01",
          designation: "Professor & HOD Pharmaceutics",
          qualification: "M.Pharm, Ph.D in Pharmaceutics",
          department: "Pharmaceutics",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacherPharmacology = await prisma.user.create({
    data: {
      name: "Dr. Anita Sharma",
      email: "anita.sharma@swathicollege.edu",
      passwordHash: teacherHash,
      role: "TEACHER",
      phone: "+91 98480 45678",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      permissions: JSON.stringify([
        "CREATE_INTERNAL_PAPER",
        "EVALUATE_INTERNAL_MARKS",
      ]),
      teacherProfile: {
        create: {
          employeeId: "FAC-PCL-02",
          designation: "Associate Professor",
          qualification: "Ph.D in Pharmacology",
          department: "Pharmacology",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacherChem = await prisma.user.create({
    data: {
      name: "Dr. V. Prasad",
      email: "prasad.v@swathicollege.edu",
      passwordHash: teacherHash,
      role: "TEACHER",
      phone: "+91 98480 56789",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      permissions: JSON.stringify([
        "CREATE_INTERNAL_PAPER",
        "EVALUATE_INTERNAL_MARKS",
      ]),
      teacherProfile: {
        create: {
          employeeId: "FAC-PCH-03",
          designation: "Associate Professor",
          qualification: "M.Pharm, Ph.D",
          department: "Pharmaceutical Chemistry",
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Assign teachers
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherPharmaceutics.teacherProfile.id,
      academicYearId: academicYear.id,
      classId: bpharm1.id,
      sectionId: secA.id,
      subjectId: subPharmaceutics.id,
    },
  });

  // Students in B.Pharmacy
  const student1User = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul.sharma@student.swathi.edu",
      passwordHash: studentHash,
      role: "STUDENT",
      phone: "+91 99887 76651",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      studentProfile: {
        create: {
          studentId: "SWC-2026-BPH-001",
          rollNo: "26BPH001",
          admissionNo: "ADM-2026-081",
          fatherName: "Sanjay Sharma",
          motherName: "Sunita Sharma",
          dob: "2006-04-12",
          gender: "Male",
          address: "H.No 4-12/1, Gandhi Nagar, Hyderabad",
          academicYearId: academicYear.id,
          classId: bpharm1.id,
          sectionId: secA.id,
          photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        },
      },
    },
    include: { studentProfile: true },
  });

  const student2User = await prisma.user.create({
    data: {
      name: "Sneha Reddy",
      email: "sneha.reddy@student.swathi.edu",
      passwordHash: studentHash,
      role: "STUDENT",
      phone: "+91 99887 76652",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      studentProfile: {
        create: {
          studentId: "SWC-2026-BPH-002",
          rollNo: "26BPH002",
          admissionNo: "ADM-2026-082",
          fatherName: "K. R. Reddy",
          motherName: "Madhavi Reddy",
          dob: "2006-07-25",
          gender: "Female",
          address: "Plot 88, Jubilee Enclave, Hyderabad",
          academicYearId: academicYear.id,
          classId: bpharm1.id,
          sectionId: secA.id,
          photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        },
      },
    },
    include: { studentProfile: true },
  });

  console.log("✓ Created Swathi College Faculty and Student Cohorts");

  // 7. Pharmacy Examination
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 1);

  const examPharm = await prisma.examination.create({
    data: {
      examCode: "EXAM-2026-SEM1-BP103T",
      title: "B.Pharmacy Sem-I Pharmaceutics-I Regular Examination 2026",
      examType: "SEMESTER_FINAL",
      academicYearId: academicYear.id,
      classId: bpharm1.id,
      sectionId: secA.id,
      subjectId: subPharmaceutics.id,
      examDate: examDate,
      startTime: "10:00",
      endTime: "13:00",
      durationMinutes: 180,
      maxMarks: 100,
      passMarks: 35,
      examMode: "OFFLINE",
      examFee: 250.0,
      releaseLeadMinutes: 120,
      releaseStatus: "RELEASED",
      releasedAt: new Date(),
      status: "EVALUATING",
      instructions:
        "1. Answer all questions from Section A and any four from Section B.\n2. Standard IP pharmaceutical formulation terminology required.",
    },
  });

  // 8. Question Paper with Rubrics
  await prisma.examPaper.create({
    data: {
      examId: examPharm.id,
      title: "Pharmaceutics-I Question Paper - Regular Set 1",
      fileUrl: "/docs/exam-papers/BP103T-Set1.pdf",
      fileType: "PDF",
      version: 1,
      status: "RELEASED",
      isReleased: true,
      uploadedById: teacherPharmaceutics.id,
      approvedById: adminUser.id,
      questions: {
        create: [
          {
            questionNumber: 1,
            sectionName: "Section A (Dosage Forms)",
            questionText: "Define Posology. Discuss the factors influencing dose calculation in pediatric formulations.",
            maxScore: 10,
            rubricGuide: "Definition of Posology (+3). Age, weight, body surface area formulas (Young's, Dilling's, Clark's) (+7).",
            modelAnswer: "Posology is branch of medical science dealing with dosage. Young's rule: Dose = [Age / (Age + 12)] * Adult Dose.",
          },
          {
            questionNumber: 2,
            sectionName: "Section B (Pharmaceutical Powders)",
            questionText: "Explain the classification and preparation of Effervescent Granules.",
            maxScore: 15,
            rubricGuide: "Composition ratio of citric acid : tartaric acid : sodium bicarbonate (+5), fusion method steps (+5), heat method (+5).",
            modelAnswer: "Ratio: 1:2:3.4. Prepared by Heat method or Fusion method at 54°C to release water of crystallization.",
          },
        ],
      },
    },
  });

  // 9. Fee Payments & Hall Tickets
  await prisma.feePayment.create({
    data: {
      studentId: student1User.studentProfile.id,
      examId: examPharm.id,
      amount: 250.0,
      currency: "INR",
      status: "PAID",
      transactionId: "TXN-UPI-9848123490",
      paymentMethod: "UPI",
      paidAt: new Date("2026-09-10"),
      receiptNo: "RCPT-2026-00412",
    },
  });

  await prisma.hallTicket.create({
    data: {
      hallTicketNumber: "HT-2026-BPH101-01",
      studentId: student1User.studentProfile.id,
      examId: examPharm.id,
      academicYearId: academicYear.id,
      centerName: "Swathi College of Pharmacy - Block A Examination Hall",
      roomNo: "Hall 201",
      seatNo: "Seat P-01",
      qrCodeData: JSON.stringify({
        hallTicketNumber: "HT-2026-BPH101-01",
        rollNo: "26BPH001",
        studentName: "Rahul Sharma",
        program: "B.Pharmacy",
        examCode: "EXAM-2026-SEM1-BP103T",
        verified: true,
      }),
      status: "ACTIVE",
    },
  });

  // 10. Answer Sheet Bundle & Evaluation
  const bundle = await prisma.answerSheetBundle.create({
    data: {
      examId: examPharm.id,
      bundleCode: "BND-2026-BPH101-SEC_A",
      totalSheets: 2,
      uploadedById: adminUser.id,
      scanStatus: "COMPLETED",
    },
  });

  await prisma.answerSheet.create({
    data: {
      bundleId: bundle.id,
      examId: examPharm.id,
      studentId: student1User.studentProfile.id,
      sheetCode: "ANS-2026-PHA-8801",
      totalPages: 4,
      isMapped: true,
      mappingConfidence: 0.99,
      evaluationStatus: "FINALIZED",
      aiTotalScore: 24.0,
      teacherTotalScore: 25.0,
      finalScore: 96.0,
      percentage: 96.0,
      grade: "A+",
      evaluatedById: teacherPharmaceutics.id,
      verifiedAt: new Date(),
      finalizedAt: new Date(),
      pages: {
        create: [
          {
            pageNumber: 1,
            imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
            ocrRawText: "Q1: Posology is the branch of pharmacy which deals with dose or quantity of medication. Young's Rule: Dose = (Age in years / Age + 12) * Adult dose.",
          },
          {
            pageNumber: 2,
            imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800",
            ocrRawText: "Q2: Effervescent granules contain sodium bicarbonate, citric acid, and tartaric acid in proportion 3.4 : 1 : 2. Fusion method involves dampening with crystal water.",
          },
        ],
      },
      questionEvaluations: {
        create: [
          {
            questionNumber: 1,
            maxMarks: 10,
            aiSuggestedMarks: 10,
            aiConfidence: 0.98,
            aiFeedback: "Exact definition and Young's rule formula provided.",
            teacherMarks: 10,
            teacherComment: "Comprehensive pediatric dose explanation.",
            isVerified: true,
          },
          {
            questionNumber: 2,
            maxMarks: 15,
            aiSuggestedMarks: 14,
            aiConfidence: 0.96,
            aiFeedback: "Precise stoichiometric ratios and fusion method steps.",
            teacherMarks: 15,
            teacherComment: "Accurate formulation stoichiometry.",
            isVerified: true,
          },
        ],
      },
    },
  });

  // 11. Exam Result
  await prisma.examResult.create({
    data: {
      studentId: student1User.studentProfile.id,
      examId: examPharm.id,
      academicYearId: academicYear.id,
      totalMarksObtained: 96.0,
      maxMarksTotal: 100.0,
      percentage: 96.0,
      gpa: 9.6,
      grade: "A+",
      resultStatus: "PASS",
      isPublished: true,
      publishedAt: new Date(),
      publishedById: adminUser.id,
      marksheetQrData: JSON.stringify({
        verificationUrl: "https://pharmacy.swathicolleges.ac.in/verify/result/SWC-2026-BPH-001",
        studentName: "Rahul Sharma",
        rollNo: "26BPH001",
        program: "B.Pharmacy",
        exam: "Pharmaceutics-I Regular 2026",
        score: "96/100 (A+)",
        status: "PASS",
      }),
    },
  });

  // 12. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdminUser.id,
        action: "INSTITUTIONAL_PORTAL_INITIALIZED",
        entity: "System",
        details: JSON.stringify({ institution: "Swathi College of Pharmacy", academicYear: "2026-2027" }),
      },
      {
        userId: adminUser.id,
        action: "EXAM_PAPER_RELEASED",
        entity: "ExamPaper",
        details: JSON.stringify({ exam: "B.Pharmacy Sem-I Pharmaceutics-I", status: "RELEASED" }),
      },
      {
        userId: teacherPharmaceutics.id,
        action: "EVALUATION_FINALIZED",
        entity: "AnswerSheet",
        details: JSON.stringify({ student: "Rahul Sharma", finalScore: 96.0 }),
      },
    ],
  });

  console.log("🚀 Swathi College of Pharmacy Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
