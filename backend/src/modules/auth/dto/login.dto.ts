import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@admin.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @MinLength(1)
  password: string;
}
