import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from "class-validator";

export class ScanQuestionPaperDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  fileDataUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}

export class EvaluateScriptDto {
  @IsNotEmpty()
  @IsString()
  questionText!: string;

  @IsNotEmpty()
  @IsNumber()
  maxMarks!: number;

  @IsNotEmpty()
  @IsString()
  modelAnswer!: string;

  @IsNotEmpty()
  @IsString()
  studentAnswerText!: string;

  @IsOptional()
  @IsArray()
  rubricSteps?: Array<{ marks: number; description: string }>;

  @IsOptional()
  @IsString()
  provider?: "gemini" | "openai" | "anthropic" | "groq" | "custom";

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
