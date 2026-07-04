import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MovimentacaoDto {
  @ApiProperty()
  @IsString()
  produtoId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}
