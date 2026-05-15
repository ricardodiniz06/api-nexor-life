import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { PatientsService } from './patients.service';
import { PatientListResponseDto } from './dto/patient-list.dto';

@ApiTags('patients')
@ApiBearerAuth('access-token')
@Controller('patients')
@UseGuards(PermissionsGuard)
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  @RequirePermissions(PermissionResource.PATIENT, PermissionAction.READ)
  @ApiOperation({
    operationId: 'patientsList',
    summary: 'Diretório de pacientes (placeholder)',
  })
  @ApiOkResponse({ type: PatientListResponseDto })
  list(): Promise<PatientListResponseDto> {
    return this.patients.listPlaceholder();
  }
}
