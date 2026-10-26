import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import bcrypt from "bcryptjs";
import {
  OnboardUserDto,
  BulkOnboardDto,
  UpdateUserRoleDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    classId?: string;
  }) {
    const isPaginated = params?.page !== undefined || params?.limit !== undefined;
    const page = params?.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params?.limit && params.limit > 0 ? Number(params.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (params?.role && params.role !== "ALL") {
      where.role = params.role;
    }

    if (params?.classId && params.classId !== "ALL") {
      where.studentProfile = { classId: params.classId };
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { studentProfile: { rollNo: { contains: q, mode: "insensitive" } } },
        { studentProfile: { studentId: { contains: q, mode: "insensitive" } } },
        { teacherProfile: { employeeId: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: {
          studentProfile: {
            include: {
              class: true,
              section: true,
              academicYear: true,
            },
          },
          teacherProfile: {
            include: {
              assignments: {
                include: { subject: true, class: true },
              },
            },
          },
        },
        ...(isPaginated ? { skip, take: limit } : {}),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      success: true,
      count: users.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      users,
    };
  }

  async getDashboardStats() {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalExams,
      activeExams,
      totalAnswerSheets,
      evaluatedSheets,
      feeSum,
      upcomingExams,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
      this.prisma.user.count({ where: { role: "TEACHER", isActive: true } }),
      this.prisma.class.count(),
      this.prisma.examination.count(),
      this.prisma.examination.count({ where: { releaseStatus: "RELEASED" } }),
      this.prisma.answerSheet.count(),
      this.prisma.answerSheet.count({ where: { evaluationStatus: "FINALIZED" } }),
      this.prisma.feePayment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),
      this.prisma.examination.findMany({
        take: 4,
        orderBy: { examDate: "asc" },
        include: { subject: true, class: true },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalExams,
        activeExams,
        totalAnswerSheets,
        evaluatedSheets,
        totalFeeCollected: feeSum._sum.amount || 0,
        upcomingExams,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            class: true,
            section: true,
            group: true,
            academicYear: true,
            feePayments: true,
            hallTickets: { include: { exam: true } },
            examResults: { include: { exam: { include: { subject: true } } } },
          },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true, academicYear: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return { success: true, user };
  }

  async getMyProfile(userId: string) {
    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            class: true,
            section: true,
            group: true,
            academicYear: true,
            feePayments: {
              include: { exam: true },
              orderBy: { createdAt: "desc" },
            },
            hallTickets: {
              include: {
                exam: {
                  include: { subject: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            examResults: {
              where: { isPublished: true },
              include: {
                exam: {
                  include: { subject: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        teacherProfile: {
          include: {
            assignments: {
              include: { subject: true, class: true, section: true, group: true, academicYear: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User profile not found");
    }

    // Role-specific stats
    let roleStats: Record<string, any> = {};
    try {
      if (user.role === "EXAM_PAPER_CREATOR") {
        const createdCount = await this.prisma.examPaper.count({ where: { uploadedById: user.id } });
        const approvedCount = await this.prisma.examPaper.count({ where: { uploadedById: user.id, status: "APPROVED" } });
        roleStats = { papersDrafted: createdCount, papersApproved: approvedCount };
      } else if (user.role === "EXAM_PAPER_EVALUATOR") {
        const evaluatedCount = await this.prisma.answerSheet.count({ where: { evaluatedById: user.id } });
        const finalizedCount = await this.prisma.answerSheet.count({ where: { evaluatedById: user.id, evaluationStatus: "FINALIZED" } });
        roleStats = { sheetsEvaluated: evaluatedCount, sheetsFinalized: finalizedCount };
      } else if (user.role === "EXAM_PAPER_CHECKER") {
        const checkedCount = await this.prisma.answerSheet.count({ where: { checkedById: user.id } });
        roleStats = { sheetsModerated: checkedCount };
      } else if (user.role === "TEACHER" && user.teacherProfile) {
        const assignmentCount = user.teacherProfile.assignments.length;
        roleStats = { assignedSubjectsCount: assignmentCount };
      } else if (user.role === "STUDENT" && user.studentProfile) {
        const totalFees = user.studentProfile.feePayments.reduce((sum: number, f: any) => sum + (f.status === "PAID" ? f.amount : 0), 0);
        const pendingFees = user.studentProfile.feePayments.filter((f: any) => f.status === "UNPAID").length;
        roleStats = { totalFeesPaid: totalFees, pendingFeeExams: pendingFees, resultsPublishedCount: user.studentProfile.examResults.length };
      } else if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        const [totalExams, totalStudents, totalTeachers] = await Promise.all([
          this.prisma.examination.count(),
          this.prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
          this.prisma.user.count({ where: { role: "TEACHER", isActive: true } }),
        ]);
        roleStats = { totalExamsManaged: totalExams, activeStudents: totalStudents, activeFaculty: totalTeachers };
      }
    } catch (statErr) {
      console.warn("Could not compute roleStats:", statErr);
    }

    // Fetch recent audit logs for this user
    let recentLogs: any[] = [];
    try {
      if (this.prisma.auditLog) {
        recentLogs = await this.prisma.auditLog.findMany({
          where: { userId: user.id },
          take: 8,
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (auditErr) {
      console.warn("Could not fetch user audit logs:", auditErr);
    }

    const { passwordHash, ...safeUser } = user;

    return {
      success: true,
      user: {
        ...safeUser,
        permissions: safeUser.permissions
          ? typeof safeUser.permissions === "string"
            ? JSON.parse(safeUser.permissions)
            : safeUser.permissions
          : [],
      },
      roleStats,
      recentLogs,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    if (!userId) {
      throw new BadRequestException("User ID is required");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, teacherProfile: true },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    const userUpdateData: any = {};
    if (dto.name && dto.name.trim()) userUpdateData.name = dto.name.trim();
    if (dto.phone !== undefined) userUpdateData.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.avatar !== undefined) userUpdateData.avatar = dto.avatar ? dto.avatar.trim() : null;

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    // If student
    if (existingUser.studentProfile) {
      const studentUpdateData: any = {};
      if (dto.fatherName !== undefined) studentUpdateData.fatherName = dto.fatherName;
      if (dto.motherName !== undefined) studentUpdateData.motherName = dto.motherName;
      if (dto.dob !== undefined) studentUpdateData.dob = dto.dob;
      if (dto.gender !== undefined) studentUpdateData.gender = dto.gender;
      if (dto.address !== undefined) studentUpdateData.address = dto.address;

      if (Object.keys(studentUpdateData).length > 0) {
        await this.prisma.studentProfile.update({
          where: { userId },
          data: studentUpdateData,
        });
      }
    }

    // If teacher/faculty/staff
    if (existingUser.teacherProfile) {
      const teacherUpdateData: any = {};
      if (dto.designation !== undefined && dto.designation.trim()) teacherUpdateData.designation = dto.designation.trim();
      if (dto.qualification !== undefined) teacherUpdateData.qualification = dto.qualification ? dto.qualification.trim() : null;
      if (dto.department !== undefined) teacherUpdateData.department = dto.department ? dto.department.trim() : null;

      if (Object.keys(teacherUpdateData).length > 0) {
        await this.prisma.teacherProfile.update({
          where: { userId },
          data: teacherUpdateData,
        });
      }
    }

    try {
      if (this.prisma.auditLog) {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "PROFILE_UPDATED",
            entity: "User",
            entityId: userId,
            details: JSON.stringify({
              updatedFields: Object.keys(dto),
            }),
          },
        });
      }
    } catch {}

    return this.getMyProfile(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = dto;

    if (!currentPassword || !newPassword) {
      throw new BadRequestException("Current password and new password are required.");
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException("New password and confirm password do not match.");
    }

    if (newPassword.length < 6) {
      throw new BadRequestException("New password must be at least 6 characters long.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException("The current password you entered is incorrect.");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    try {
      if (this.prisma.auditLog) {
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: "PASSWORD_CHANGED",
            entity: "User",
            entityId: userId,
            details: JSON.stringify({ email: user.email, timestamp: new Date().toISOString() }),
          },
        });
      }
    } catch {}

    return {
      success: true,
      message: "Password has been successfully changed.",
    };
  }

  async onboardUser(dto: OnboardUserDto, adminId?: string) {
    const {
      type,
      name,
      email,
      phone,
      password,
      role,
      designation,
      employeeId,
      department,
      qualification,
      rollNo,
      studentId,
      admissionNo,
      classId,
      sectionId,
      academicYearId,
      fatherName,
      gender,
      dob,
    } = dto;

    if (!name || !email) {
      throw new BadRequestException("Name and Email are required.");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException("Email already registered.");
    }

    const defaultPassword =
      password ||
      (type === "admin" ? "Admin@123" : type === "teacher" ? "Teacher@123" : "Student@123");
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    let newUser: any;

    if (type === "admin") {
      newUser = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: role || "ADMIN",
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
    } else if (type === "teacher") {
      newUser = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: "TEACHER",
          teacherProfile: {
            create: {
              employeeId: employeeId || `FAC-${Date.now().toString().slice(-4)}`,
              department: department || "Pharmaceutics",
              designation: designation || "Assistant Professor",
              qualification: qualification || "M.Pharm",
            },
          },
        },
        include: { teacherProfile: true },
      });
    } else {
      const defaultClass = await this.prisma.class.findFirst();
      const defaultSection = await this.prisma.section.findFirst({
        where: { classId: defaultClass?.id },
      });
      const defaultAy = await this.prisma.academicYear.findFirst({
        where: { isCurrent: true },
      });

      newUser = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: "STUDENT",
          studentProfile: {
            create: {
              studentId: studentId || `SWC-2026-${Date.now().toString().slice(-4)}`,
              rollNo: rollNo || `${Date.now().toString().slice(-6)}`,
              admissionNo: admissionNo || `ADM-${Date.now().toString().slice(-4)}`,
              fatherName,
              gender: gender || "Male",
              dob,
              classId: classId || defaultClass?.id || "",
              sectionId: sectionId || defaultSection?.id || "",
              academicYearId: academicYearId || defaultAy?.id || "",
            },
          },
        },
        include: { studentProfile: true },
      });
    }

    if (this.prisma.auditLog && adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: "USER_ONBOARDED",
            entity: "User",
            entityId: newUser.id,
            details: JSON.stringify({ role: newUser.role, email: newUser.email, name: newUser.name }),
          },
        });
      } catch {}
    }

    return { success: true, user: newUser };
  }

  async bulkOnboard(dto: BulkOnboardDto) {
    const { type, records } = dto;
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new BadRequestException("No records provided");
    }

    let createdCount = 0;
    const defaultAdminHash = await bcrypt.hash("Admin@123", 10);
    const defaultTeacherHash = await bcrypt.hash("Teacher@123", 10);
    const defaultStudentHash = await bcrypt.hash("Student@123", 10);

    const [academicYears, classes, sections] = await Promise.all([
      this.prisma.academicYear.findMany(),
      this.prisma.class.findMany(),
      this.prisma.section.findMany(),
    ]);

    const defaultAy = academicYears.find((a) => a.isCurrent) || academicYears[0];
    const defaultClass = classes[0];
    const defaultSection = sections[0];

    for (const row of records) {
      const email = row.Email?.trim().toLowerCase();
      const name = row.Name?.trim();
      if (!email || !name) continue;

      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) continue;

      const passwordHash = row.Password
        ? await bcrypt.hash(row.Password.trim(), 10)
        : type === "admin"
        ? defaultAdminHash
        : type === "teacher"
        ? defaultTeacherHash
        : defaultStudentHash;

      if (type === "admin") {
        await this.prisma.user.create({
          data: {
            name,
            email,
            phone: row.Phone || null,
            passwordHash,
            role: row.Role?.toUpperCase() === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
          },
        });
        createdCount++;
      } else if (type === "teacher") {
        await this.prisma.user.create({
          data: {
            name,
            email,
            phone: row.Phone || null,
            passwordHash,
            role: "TEACHER",
            teacherProfile: {
              create: {
                employeeId: row.EmployeeId?.trim() || `FAC-${Date.now().toString().slice(-4)}`,
                department: row.Department || "Pharmaceutics",
                designation: row.Designation || "Assistant Professor",
                qualification: row.Qualification || "M.Pharm",
              },
            },
          },
        });
        createdCount++;
      } else {
        const matchedClass =
          classes.find((c) => c.code.toLowerCase() === row.ClassCode?.trim().toLowerCase()) ||
          defaultClass;
        const matchedSection =
          sections.find((s) => s.classId === matchedClass?.id) || defaultSection;

        await this.prisma.user.create({
          data: {
            name,
            email,
            phone: row.Phone || null,
            passwordHash,
            role: "STUDENT",
            studentProfile: {
              create: {
                studentId: row.StudentId?.trim() || `SWC-2026-${Date.now().toString().slice(-4)}`,
                rollNo: row.RollNo?.trim() || `${Date.now().toString().slice(-6)}`,
                admissionNo: row.AdmissionNo || `ADM-${Date.now().toString().slice(-4)}`,
                fatherName: row.FatherName || null,
                gender: row.Gender || "Male",
                dob: row.DOB || null,
                classId: matchedClass.id,
                sectionId: matchedSection.id,
                academicYearId: defaultAy.id,
              },
            },
          },
        });
        createdCount++;
      }
    }

    return { success: true, count: createdCount };
  }

  async updateRole(dto: UpdateUserRoleDto, adminId?: string) {
    const {
      userId,
      role,
      permissions,
      isActive,
      isTimeRestricted,
      timeWindowStart,
      timeWindowEnd,
      dailyStartTime,
      dailyEndTime,
    } = dto;

    if (!userId) {
      throw new BadRequestException("User ID is required.");
    }

    const permissionsPayload =
      typeof permissions === "string" ? permissions : JSON.stringify(permissions || []);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role } : {}),
        ...(permissions !== undefined ? { permissions: permissionsPayload } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isTimeRestricted !== undefined ? { isTimeRestricted } : {}),
        ...(timeWindowStart !== undefined
          ? { timeWindowStart: timeWindowStart ? new Date(timeWindowStart) : null }
          : {}),
        ...(timeWindowEnd !== undefined
          ? { timeWindowEnd: timeWindowEnd ? new Date(timeWindowEnd) : null }
          : {}),
        ...(dailyStartTime !== undefined ? { dailyStartTime } : {}),
        ...(dailyEndTime !== undefined ? { dailyEndTime } : {}),
      },
    });

    if (this.prisma.auditLog && adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: adminId,
            action: "USER_ROLE_PERMISSIONS_UPDATED",
            entity: "User",
            entityId: userId,
            details: JSON.stringify({ updatedRole: role, isTimeRestricted }),
          },
        });
      } catch {}
    }

    return { success: true, user: updatedUser };
  }

  async deleteUser(id: string, currentAdminId: string) {
    if (currentAdminId === id) {
      throw new BadRequestException("Cannot delete your own active administrator account.");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException("User not found.");
    }

    await this.prisma.user.delete({ where: { id } });

    if (this.prisma.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: currentAdminId,
            action: "USER_DELETED_BY_ADMIN",
            entity: "User",
            entityId: id,
            details: JSON.stringify({
              deletedUserName: targetUser.name,
              deletedUserEmail: targetUser.email,
              deletedUserRole: targetUser.role,
            }),
          },
        });
      } catch {}
    }

    return {
      success: true,
      message: `User ${targetUser.name} (${targetUser.role}) deleted successfully.`,
    };
  }

  async getStudentDashboard(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    const [exams, feePayments, results, hallTickets] = await Promise.all([
      this.prisma.examination.findMany({
        where: student ? { classId: student.classId } : {},
        include: { subject: true, class: true },
        orderBy: { examDate: "asc" },
        take: 6,
      }),
      this.prisma.feePayment.findMany({
        where: student ? { studentId: student.id } : {},
        include: { exam: true },
        take: 6,
      }),
      this.prisma.examResult.findMany({
        where: student ? { studentId: student.id, isPublished: true } : {},
        include: { exam: { include: { subject: true } } },
        take: 6,
      }),
      this.prisma.hallTicket.findMany({
        where: student ? { studentId: student.id } : {},
        include: { exam: true },
        take: 6,
      }),
    ]);

    return {
      success: true,
      exams,
      feePayments,
      results,
      hallTickets,
    };
  }

  async getStudentExams(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        class: true,
        section: true,
        academicYear: true,
      },
    });

    if (!student) {
      return { success: false, student: null, exams: [] };
    }

    const exams = await this.prisma.examination.findMany({
      where: { classId: student.classId },
      include: {
        academicYear: true,
        subject: true,
        papers: true,
      },
      orderBy: { examDate: "asc" },
    });

    return { success: true, student, exams };
  }

  async getStudentFees(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
        section: true,
        feePayments: {
          include: { exam: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, student };
  }

  async getStudentHallTickets(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
        section: true,
        academicYear: true,
        feePayments: true,
        hallTickets: {
          include: {
            exam: {
              include: { subject: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, student };
  }

  async getStudentResults(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        class: true,
        section: true,
        academicYear: true,
        examResults: {
          where: { isPublished: true },
          include: {
            exam: {
              include: { subject: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, student };
  }
}
