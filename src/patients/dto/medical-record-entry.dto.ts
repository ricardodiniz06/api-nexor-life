import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { RecordEntryType } from '../entities/medical-record-entry.entity';

export class CreateMedicalRecordEntryDto {
  @ApiProperty({ enum: RecordEntryType, default: RecordEntryType.CONSULTATION })
  @IsEnum(RecordEntryType)
  type!: RecordEntryType;

  @ApiProperty({ example: 'Evolução Médica Diária' })
  @IsString()
  @Length(2, 200)
  title!: string;

  @ApiProperty({ example: 'Paciente lúcido, orientado, afebril, eupneico em ar ambiente.' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: 'Manter analgesia e observar saturação.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'I21.0' })
  @IsOptional()
  @IsString()
  icdCode?: string;

  @ApiPropertyOptional({ example: 'Infarto agudo transmural do miocárdio da parede anterior' })
  @IsOptional()
  @IsString()
  icdDescription?: string;

  @ApiPropertyOptional({
    example: [{ name: 'Aspirina', dosage: '100mg', frequency: '1x ao dia (manhã)', route: 'Oral' }],
  })
  @IsOptional()
  @IsArray()
  prescriptions?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
  }>;

  @ApiPropertyOptional({ example: 'Dr. Carlos Silva' })
  @IsOptional()
  @IsString()
  professionalName?: string;

  @ApiPropertyOptional({ example: 'CRM/SP 123456' })
  @IsOptional()
  @IsString()
  professionalCouncil?: string;

  @ApiPropertyOptional({ example: 'UTI' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: '2026-08-27T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;
}
