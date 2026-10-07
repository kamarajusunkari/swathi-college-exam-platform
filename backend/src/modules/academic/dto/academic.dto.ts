import { IsNotEmpty, IsOptional, IsString, IsArray, IsNumber } from "class-validator";

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  sectionName?: string;
}

export class BulkClassDto {
  @IsArray()
  classes!: Array<{
    name: string;
    code: string;
    section?: string;
  }>;
}

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsArray()
  classIds?: string[];

  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  passMarks?: number;

  @IsOptional()
  @IsNumber()
  credits?: number;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;
}

export class UpdateSubjectDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  passMarks?: number;

  @IsOptional()
  @IsNumber()
  credits?: number;
}

export class MapSubjectClassesDto {
  @IsNotEmpty()
  @IsString()
  sourceSubjectId!: string;

  @IsArray()
  targetClassIds!: string[];

  @IsOptional()
  copyTeacher?: boolean;

  @IsOptional()
  perClassTeachers?: Record<string, string>;
}

export class AssignTeacherDto {
  @IsNotEmpty()
  @IsString()
  subjectId!: string;

  @IsNotEmpty()
  @IsString()
  teacherId!: string;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  sectionId?: string;
}
