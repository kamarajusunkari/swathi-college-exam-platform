import { IsNotEmpty, IsString } from "class-validator";

export class SwitchRoleDto {
  @IsNotEmpty()
  @IsString()
  role!: string;
}
