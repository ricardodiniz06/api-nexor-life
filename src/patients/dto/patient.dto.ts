import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { LegalBasis, PatientGender, PatientStatus } from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({ example: 'Maria dos Santos' })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ example: 'Maria Santos' })
  @IsOptional()
  @IsString()
  socialName?: string;

  @ApiPropertyOptional({ example: '12345678900' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ example: '12.345.678-9' })
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiProperty({ example: '1985-05-12' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ enum: PatientGender, default: PatientGender.OTHER })
  @IsEnum(PatientGender)
  gender!: PatientGender;

  @ApiPropertyOptional({ example: 'A+' })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ example: 68.5 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 165 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ enum: PatientStatus, default: PatientStatus.OUTPATIENT })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @ApiPropertyOptional({ example: 'Enfermaria' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ example: 'Leito 12B' })
  @IsOptional()
  @IsString()
  bed?: string;

  @ApiPropertyOptional({ example: 'Dr. Carlos Silva' })
  @IsOptional()
  @IsString()
  attendingPhysician?: string;

  @ApiPropertyOptional({ example: '11999991111' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'maria@email.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - São Paulo, SP' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'UUID do convenio' })
  @IsOptional()
  @IsUUID()
  convenioId?: string;

  @ApiPropertyOptional({ example: 'Unimed' })
  @IsOptional()
  @IsString()
  insuranceName?: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsOptional()
  @IsString()
  insuranceCardNumber?: string;

  @ApiPropertyOptional({ enum: LegalBasis, default: LegalBasis.TUTELA_DA_SAUDE })
  @IsOptional()
  @IsEnum(LegalBasis)
  legalBasis?: LegalBasis;
}

export class UpdatePatientDto extends CreatePatientDto {}
