import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, IsBoolean } from "class-validator";

export class QuestionBlueprintDto {
  @IsNumber()
  questionNumber!: number;

  @IsNotEmpty()
  @IsString()
  questionText!: string;

  @IsNumber()
  maxScore!: number;

  @IsOptional()
  @IsString()
  modelAnswer?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  rubricGuide?: string;
}

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  subjectId!: string;

  @IsNotEmpty()
  @IsString()
  classId!: string;

  @IsNotEmpty()
  @IsString()
  academicYearId!: string;

  @IsNotEmpty()
  examDate!: string | Date;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  passMarks?: number;

  @IsOptional()
  @IsString()
  examType?: string;

  @IsOptional()
  @IsNumber()
  examFee?: number;

  @IsOptional()
  @IsNumber()
  releaseLeadMinutes?: number;

  @IsOptional()
  @IsArray()
  questions?: QuestionBlueprintDto[];
}

export class TogglePaperReleaseDto {
  @IsOptional()
  @IsString()
  paperId?: string;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsBoolean()
  release?: boolean;
}
