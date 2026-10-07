import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class PayFeeDto {
  @IsNotEmpty()
  @IsString()
  paymentId!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
