import { IsNotEmpty, IsOptional, IsString, IsArray, IsBoolean } from "class-validator";

export class OnboardUserDto {
  @IsNotEmpty()
  @IsString()
  type!: "admin" | "teacher" | "student";

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  rollNo?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  admissionNo?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dob?: string;
}

export class BulkOnboardDto {
  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsArray()
  records!: any[];
}

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  permissions?: string[] | string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTimeRestricted?: boolean;

  @IsOptional()
  @IsString()
  timeWindowStart?: string | null;

  @IsOptional()
  @IsString()
  timeWindowEnd?: string | null;

  @IsOptional()
  @IsString()
  dailyStartTime?: string | null;

  @IsOptional()
  @IsString()
  dailyEndTime?: string | null;
}
