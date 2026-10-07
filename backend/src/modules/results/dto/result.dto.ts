import { IsNotEmpty, IsOptional, IsString, IsBoolean } from "class-validator";

export class PublishResultsDto {
  @IsNotEmpty()
  @IsString()
  examId!: string;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
