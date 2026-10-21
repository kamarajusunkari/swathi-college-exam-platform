import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, IsBoolean } from "class-validator";

export class EvaluationItemDto {
  @IsNumber()
  questionNumber!: number;

  @IsNumber()
  marksAwarded!: number;

  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class SubmitEvaluationDto {
  @IsNotEmpty()
  @IsString()
  answerSheetId!: string;

  @IsArray()
  evaluations!: EvaluationItemDto[];

  @IsOptional()
  @IsString()
  overallRemarks?: string;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

export class CreateBundleDto {
  @IsOptional()
  @IsString()
  bundleCode?: string;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsNumber()
  totalSheets?: number;

  @IsOptional()
  @IsString()
  scanStatus?: string;
}

export class CheckModerationDto {
  @IsNotEmpty()
  @IsString()
  answerSheetId!: string;

  @IsOptional()
  @IsNumber()
  adjustedScore?: number;

  @IsOptional()
  @IsString()
  checkerNotes?: string;

  @IsOptional()
  @IsArray()
  questionAdjustments?: Array<{
    questionNumber: number;
    adjustedMarks: number;
    remarks?: string;
  }>;
}

export class OverrideMarksDto {
  @IsNotEmpty()
  @IsString()
  answerSheetId!: string;

  @IsOptional()
  @IsNumber()
  finalScore?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class IngestAnswerSheetsDto {
  @IsNotEmpty()
  @IsString()
  examId!: string;

  @IsArray()
  sheets!: Array<{
    sheetCode?: string;
    studentId?: string;
    rollNo?: string;
    totalPages?: number;
    aiTotalScore?: number;
    finalScore?: number;
  }>;
}

export class RevaluationRequestDto {
  @IsNotEmpty()
  @IsString()
  answerSheetId!: string;

  @IsNotEmpty()
  @IsString()
  reason!: string;
}
