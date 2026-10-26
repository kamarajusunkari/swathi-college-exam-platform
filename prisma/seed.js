// Seed script for Swathi College of Pharmacy Examination Platform
// Dynamic Super Admin root initialization with zero mock user data
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load environment variables dynamically
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Clean Database Seed for Swathi College Exam Platform...");

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

  console.log("✓ Cleared all mock users and existing transactional records");

  // 2. Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2026-2027",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-05-31"),
      isCurrent: true,
    },
  });

  // 3. Classes / Programs (Official B.Pharmacy Curriculum)
  const bpharm1 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - 1st Year",
      code: "BPHARM-1",
      description: "Bachelor of Pharmacy 1st Year (Semester I & II)",
    },
  });

  const bpharm2 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - 2nd Year",
      code: "BPHARM-2",
      description: "Bachelor of Pharmacy 2nd Year (Semester III & IV)",
    },
  });

  const bpharm3 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - 3rd Year",
      code: "BPHARM-3",
      description: "Bachelor of Pharmacy 3rd Year (Semester V & VI)",
    },
  });

  const bpharm4 = await prisma.class.create({
    data: {
      name: "B.Pharmacy - Final Year",
      code: "BPHARM-4",
      description: "Bachelor of Pharmacy Final Year (Semester VII & VIII)",
    },
  });

  // 4. Sections
  const secA = await prisma.section.create({
    data: { name: "Section A", classId: bpharm1.id },
  });
  const secB = await prisma.section.create({
    data: { name: "Section B", classId: bpharm1.id },
  });

  // 5. Academic Groups
  const groupPharm = await prisma.group.create({
    data: { name: "Pharmacy (Core)", code: "BPH-CORE", classId: bpharm1.id },
  });

  // 6. Curriculum Subjects
  const subPharmaceutics = await prisma.subject.create({
    data: {
      name: "Pharmaceutics - I (General Pharmacy)",
      code: "PHARM-101",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subChemistry = await prisma.subject.create({
    data: {
      name: "Pharmaceutical Inorganic Chemistry",
      code: "PIC-101",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subAnatomy = await prisma.subject.create({
    data: {
      name: "Human Anatomy and Physiology - I",
      code: "HAP-101",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subAnalysis = await prisma.subject.create({
    data: {
      name: "Pharmaceutical Analysis - I",
      code: "PA-101",
      classId: bpharm1.id,
      maxMarks: 100,
      passMarks: 35,
      credits: 4,
    },
  });

  const subCommunication = await prisma.subject.create({
    data: {
      name: "Communication Skills & Professional Ethics",
      code: "CS-101",
      classId: bpharm1.id,
      maxMarks: 50,
      passMarks: 18,
      credits: 2,
    },
  });

  console.log("✓ Initialized Academic Curriculum & Master Hierarchy");

  // 7. Dynamic Super Admin Root User
  const superAdminName = process.env.SUPER_ADMIN_NAME || "Dr. K. S. Narayana";
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@swathicollege.edu").toLowerCase().trim();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE || "+91 98480 12345";
  const superAdminAvatar = process.env.SUPER_ADMIN_AVATAR || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

  // High-security bcrypt hash (12 salt rounds for root super administrator)
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdminPermissions = [
    "SUPER_ADMIN_CLEARANCE",
    "MANAGE_USERS",
    "MANAGE_ROLES",
    "MANAGE_ACADEMIC",
    "MANAGE_EXAMS",
    "CREATE_MAIN_PAPER",
    "APPROVE_MAIN_PAPER",
    "RELEASE_EXAM_PAPERS",
    "EVALUATE_MAIN_SHEETS",
    "CHECK_MAIN_SHEETS",
    "OVERRIDE_MARKS",
    "PUBLISH_RESULTS",
    "MANAGE_FEES",
    "ISSUE_HALL_TICKETS",
    "AUDIT_ACCESS",
    "TIME_WINDOW_OVERRIDE",
  ];

  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    create: {
      name: superAdminName,
      email: superAdminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
      phone: superAdminPhone,
      avatar: superAdminAvatar,
      isActive: true,
      isTimeRestricted: false,
      permissions: JSON.stringify(superAdminPermissions),
    },
    update: {
      name: superAdminName,
      passwordHash,
      role: "SUPER_ADMIN",
      phone: superAdminPhone,
      avatar: superAdminAvatar,
      isActive: true,
      isTimeRestricted: false,
      permissions: JSON.stringify(superAdminPermissions),
    },
  });

  console.log("✓ Created Secure Super Administrator Root Account");

  // 8. Clean Examination Blueprint Template (No mock student answers)
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 7);

  const sampleExam = await prisma.examination.create({
    data: {
      examCode: "EXAM-2026-BPH-101",
      title: "B.Pharmacy Sem-I Pharmaceutics-I Mid-Term Examination 2026",
      examType: "MID_TERM",
      academicYearId: academicYear.id,
      classId: bpharm1.id,
      sectionId: secA.id,
      groupId: groupPharm.id,
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
      releaseStatus: "SCHEDULED",
      status: "UPCOMING",
      instructions:
        "1. Controlled 2-hour question paper release engine is enforced.\n2. Barcode/QR answer booklets must be distributed.\n3. Calculators permitted as per institutional norms.",
    },
  });

  // 9. Initial Blueprint Question Paper
  await prisma.examPaper.create({
    data: {
      examId: sampleExam.id,
      title: "Pharmaceutics - I Blueprint & Rubric Model Paper",
      version: 1,
      status: "DRAFT",
      isReleased: false,
      uploadedById: superAdminUser.id,
      questions: {
        create: [
          {
            questionNumber: 1,
            sectionName: "Section A (Dosage Forms)",
            questionText: "Define posology and discuss various factors affecting the dose of a drug.",
            maxScore: 10,
            rubricGuide: "Definition of posology (+2), factors including age, body weight, sex, route of administration, and pathological states (+8).",
            modelAnswer: "Posology is the branch of medical science which deals with dosage. Factors include age (Young's & Dilling's rule), body surface area, gender, and route of administration.",
          },
          {
            questionNumber: 2,
            sectionName: "Section B (Pharmaceutical Calculations)",
            questionText: "Calculate the volume of 95% alcohol required to prepare 500 mL of 70% alcohol using alligation method.",
            maxScore: 10,
            rubricGuide: "Alligation setup (+4), proportional ratio calculation (+4), final volume derivation (+2).",
            modelAnswer: "Alligation method: (70 - 0) parts of 95% alcohol and (95 - 70) parts of water. Proportion = 70/95 * 500 mL = 368.42 mL.",
          },
        ],
      },
    },
  });

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdminUser.id,
      action: "SUPER_ADMIN_INITIALIZED",
      entity: "User",
      entityId: superAdminUser.id,
      details: JSON.stringify({
        status: "Production Ready",
        rootAdminEmail: superAdminEmail,
        rootAdminName: superAdminName,
        role: "SUPER_ADMIN",
        securityProtocol: "Bcrypt 12 Rounds + Full Access Clearance",
        mockUsersRemoved: true,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  console.log("\n==================================================================");
  console.log("🚀 Swathi College Platform Seed Completed Successfully!");
  console.log(`👤 Super Admin Name:     ${superAdminName}`);
  console.log(`📧 Super Admin Email:    ${superAdminEmail}`);
  console.log(`🔑 Super Admin Password: ${superAdminPassword}`);
  console.log(`🛡️  Role Clearance:       SUPER_ADMIN (Master Control)`);
  console.log("🧹 Mock Users Cleaned:   Zero mock students, teachers, or staff created.");
  console.log("🎓 All platform users can be securely onboarded via Super Admin Console.");
  console.log("==================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
