// Seed script for Swathi College Examination Platform
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed for Swathi College Exam Platform...");

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

  // 3. Classes
  const class10 = await prisma.class.create({
    data: {
      name: "Grade 10 (Secondary)",
      code: "CLASS-10",
      description: "Secondary School Certificate Examination Batch",
    },
  });

  const classInter1 = await prisma.class.create({
    data: {
      name: "Intermediate 1st Year (Junior College)",
      code: "INTER-1",
      description: "Higher Secondary Junior Division",
    },
  });

  // 4. Sections
  const secA = await prisma.section.create({
    data: { name: "Section A", classId: class10.id },
  });
  const secB = await prisma.section.create({
    data: { name: "Section B", classId: class10.id },
  });

  // 5. Groups
  const groupMpc = await prisma.group.create({
    data: { name: "Science (MPC)", code: "MPC", classId: class10.id },
  });
  const groupBipc = await prisma.group.create({
    data: { name: "Science (BiPC)", code: "BIPC", classId: class10.id },
  });

  // 6. Subjects
  const subMaths = await prisma.subject.create({
    data: {
      name: "Mathematics - Pure & Applied",
      code: "MTH-101",
      classId: class10.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subPhysics = await prisma.subject.create({
    data: {
      name: "Physics - Concepts & Mechanics",
      code: "PHY-101",
      classId: class10.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subChemistry = await prisma.subject.create({
    data: {
      name: "Chemistry - Inorganic & Organic",
      code: "CHE-101",
      classId: class10.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  console.log("✓ Created Academic Hierarchy");

  // 7. Hash Passwords
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
    },
  });

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      name: "M. Venkat Rao (Exam Controller)",
      email: "exam.controller@swathicollege.edu",
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "+91 98480 23456",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      permissions: JSON.stringify([
        "MANAGE_STUDENTS",
        "MANAGE_EXAMS",
        "UPLOAD_PAPERS",
        "MANAGE_FEES",
        "ISSUE_HALL_TICKETS",
        "MANAGE_ANSWER_SHEETS",
        "PUBLISH_RESULTS",
      ]),
    },
  });

  // Teachers
  const teacherMath = await prisma.user.create({
    data: {
      name: "Prof. Ramesh Kumar",
      email: "prof.ramesh@swathicollege.edu",
      passwordHash: teacherHash,
      role: "TEACHER",
      phone: "+91 98480 34567",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      teacherProfile: {
        create: {
          employeeId: "FAC-MTH-01",
          designation: "Senior Faculty & HOD Mathematics",
          qualification: "Ph.D in Applied Mathematics",
          department: "Mathematics & Statistics",
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Assign teachers
  await prisma.teacherAssignment.create({
    data: {
      teacherId: teacherMath.teacherProfile.id,
      academicYearId: academicYear.id,
      classId: class10.id,
      sectionId: secA.id,
      groupId: groupMpc.id,
      subjectId: subMaths.id,
    },
  });

  // Students
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
          studentId: "SWC-2026-1001",
          rollNo: "261001",
          admissionNo: "ADM-2026-081",
          fatherName: "Sanjay Sharma",
          motherName: "Sunita Sharma",
          dob: "2009-04-12",
          gender: "Male",
          address: "H.No 4-12/1, Gandhi Nagar, Hyderabad",
          academicYearId: academicYear.id,
          classId: class10.id,
          sectionId: secA.id,
          groupId: groupMpc.id,
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
          studentId: "SWC-2026-1002",
          rollNo: "261002",
          admissionNo: "ADM-2026-082",
          fatherName: "K. R. Reddy",
          motherName: "Madhavi Reddy",
          dob: "2009-07-25",
          gender: "Female",
          address: "Plot 88, Jubilee Enclave, Hyderabad",
          academicYearId: academicYear.id,
          classId: class10.id,
          sectionId: secA.id,
          groupId: groupMpc.id,
          photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        },
      },
    },
    include: { studentProfile: true },
  });

  console.log("✓ Created Users with bcrypt hashed passwords");

  // 8. Examinations
  const mathExamDate = new Date();
  mathExamDate.setDate(mathExamDate.getDate() + 1);

  const examMath = await prisma.examination.create({
    data: {
      examCode: "EXAM-2026-MID-MTH",
      title: "Mid-Term Mathematics Board Examination 2026",
      examType: "MID_TERM",
      academicYearId: academicYear.id,
      classId: class10.id,
      sectionId: secA.id,
      groupId: groupMpc.id,
      subjectId: subMaths.id,
      examDate: mathExamDate,
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
        "1. Write roll numbers clearly on physical answer booklets.\n2. Do not use unauthorized electronic gadgets.\n3. Complete all Sections A and B.",
    },
  });

  // 9. Question Paper with Rubrics
  await prisma.examPaper.create({
    data: {
      examId: examMath.id,
      title: "Mathematics Question Paper - Set A",
      fileUrl: "/docs/exam-papers/MTH-101-SetA.pdf",
      fileType: "PDF",
      version: 1,
      status: "RELEASED",
      isReleased: true,
      uploadedById: teacherMath.id,
      approvedById: adminUser.id,
      questions: {
        create: [
          {
            questionNumber: 1,
            sectionName: "Section A (Algebra & Quadratics)",
            questionText: "Solve for x: 2x² - 7x + 3 = 0 using factorization.",
            maxScore: 10,
            rubricGuide: "Factorization: (2x - 1)(x - 3) = 0 (+4). Roots: x = 1/2, 3 (+6).",
            modelAnswer: "(2x - 1)(x - 3) = 0 => x = 1/2 or x = 3.",
          },
          {
            questionNumber: 2,
            sectionName: "Section A (Trigonometry)",
            questionText: "Prove that (sin θ / (1 + cos θ)) + ((1 + cos θ) / sin θ) = 2 cosec θ.",
            maxScore: 15,
            rubricGuide: "Common denominator (+5), simplify to 2/sin θ (+5), 2 cosec θ (+5).",
            modelAnswer: "2(1 + cos θ) / [sin θ(1 + cos θ)] = 2/sin θ = 2 cosec θ.",
          },
        ],
      },
    },
  });

  // 10. Fee Payments & Hall Tickets
  await prisma.feePayment.create({
    data: {
      studentId: student1User.studentProfile.id,
      examId: examMath.id,
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
      hallTicketNumber: "HT-2026-1001-MTH",
      studentId: student1User.studentProfile.id,
      examId: examMath.id,
      academicYearId: academicYear.id,
      centerName: "Swathi College Main Campus - Exam Block A",
      roomNo: "Hall 101",
      seatNo: "Seat A-01",
      qrCodeData: JSON.stringify({
        hallTicketNumber: "HT-2026-1001-MTH",
        rollNo: "261001",
        studentName: "Rahul Sharma",
        examCode: "EXAM-2026-MID-MTH",
        verified: true,
      }),
      status: "ACTIVE",
    },
  });

  // 11. Scanned Answer Sheet Bundle & Student Answer Sheets
  const bundle = await prisma.answerSheetBundle.create({
    data: {
      examId: examMath.id,
      bundleCode: "BND-2026-MTH-SEC_A-01",
      totalSheets: 2,
      uploadedById: adminUser.id,
      scanStatus: "COMPLETED",
    },
  });

  await prisma.answerSheet.create({
    data: {
      bundleId: bundle.id,
      examId: examMath.id,
      studentId: student1User.studentProfile.id,
      sheetCode: "ANS-2026-8801",
      totalPages: 4,
      isMapped: true,
      mappingConfidence: 0.98,
      evaluationStatus: "FINALIZED",
      aiTotalScore: 25.0,
      teacherTotalScore: 24.0,
      finalScore: 94.0,
      percentage: 94.0,
      grade: "A+",
      evaluatedById: teacherMath.id,
      verifiedAt: new Date(),
      finalizedAt: new Date(),
      pages: {
        create: [
          {
            pageNumber: 1,
            imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
            ocrRawText: "Q1: 2x² - 7x + 3 = 0. Factorization: (2x - 1)(x - 3) = 0 => x = 1/2 or x = 3.",
          },
          {
            pageNumber: 2,
            imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800",
            ocrRawText: "Q2: LHS = [sin²θ + (1 + cos θ)²] / [sin θ(1 + cos θ)] = 2/sin θ = 2 cosec θ = RHS.",
          },
        ],
      },
      questionEvaluations: {
        create: [
          {
            questionNumber: 1,
            maxMarks: 10,
            aiSuggestedMarks: 10,
            aiConfidence: 0.96,
            aiFeedback: "Exact factorization steps.",
            teacherMarks: 10,
            teacherComment: "Flawless algebraic derivation.",
            isVerified: true,
          },
          {
            questionNumber: 2,
            maxMarks: 15,
            aiSuggestedMarks: 15,
            aiConfidence: 0.94,
            aiFeedback: "Correct identity proof.",
            teacherMarks: 14,
            teacherComment: "Clean identity proof.",
            isVerified: true,
          },
        ],
      },
    },
  });

  // 12. Exam Result for Rahul Sharma
  await prisma.examResult.create({
    data: {
      studentId: student1User.studentProfile.id,
      examId: examMath.id,
      academicYearId: academicYear.id,
      totalMarksObtained: 94.0,
      maxMarksTotal: 100.0,
      percentage: 94.0,
      gpa: 9.4,
      grade: "A+",
      resultStatus: "PASS",
      isPublished: true,
      publishedAt: new Date(),
      publishedById: adminUser.id,
      marksheetQrData: JSON.stringify({
        verificationUrl: "https://swathicollege.edu/verify/result/SWC-2026-1001",
        studentName: "Rahul Sharma",
        rollNo: "261001",
        exam: "Mid-Term Mathematics 2026",
        score: "94/100 (A+)",
        status: "PASS",
      }),
    },
  });

  // 13. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdminUser.id,
        action: "SYSTEM_INITIALIZED",
        entity: "System",
        details: JSON.stringify({ status: "Online", academicYear: "2026-2027" }),
      },
      {
        userId: adminUser.id,
        action: "EXAM_PAPER_RELEASED",
        entity: "ExamPaper",
        details: JSON.stringify({ exam: "Mid-Term Mathematics", releaseWindow: "2-Hour Pre-Exam" }),
      },
      {
        userId: teacherMath.id,
        action: "EVALUATION_FINALIZED",
        entity: "AnswerSheet",
        details: JSON.stringify({ student: "Rahul Sharma", finalScore: 94.0 }),
      },
    ],
  });

  console.log("🚀 Database Seed with Bcrypt Hashing Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
