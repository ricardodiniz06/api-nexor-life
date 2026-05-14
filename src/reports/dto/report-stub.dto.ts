import { ApiProperty } from '@nestjs/swagger';

export class ReportStubDto {
  @ApiProperty({ example: 'admissions-monthly' })
  id!: string;

  @ApiProperty({ example: 'Monthly admissions' })
  title!: string;

  @ApiProperty({ example: 'operations' })
  category!: string;
}
