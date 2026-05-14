import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../core/decorators/roles.decorator';
import { RolesGuard } from '../core/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { PatientsService } from './patients.service';
import { PatientListResponseDto } from './dto/patient-list.dto';

@ApiTags('patients')
@ApiBearerAuth('access-token')
@Controller('patients')
@UseGuards(RolesGuard)
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CLINICIAN)
  @ApiOperation({
    operationId: 'patientsList',
    summary: 'Diretório de pacientes (placeholder)',
    description:
      'Contrato estruturado para migração do Next.js (`/medical-records`) — sem dados clínicos sensíveis nas respostas até o modelo clínico existir.',
  })
  @ApiOkResponse({ type: PatientListResponseDto })
  list(): Promise<PatientListResponseDto> {
    return this.patients.listPlaceholder();
  }
}
