import { IsOptional, IsString } from "class-validator";

export class PayFeeDto {
  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

