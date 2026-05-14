import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertItemDto } from './dto/alert-item.dto';

@ApiTags('alerts')
@ApiBearerAuth('access-token')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Get()
  @ApiOperation({
    operationId: 'alertsList',
    summary: 'Alertas operacionais ativos (stub)',
  })
  @ApiOkResponse({ type: [AlertItemDto] })
  list(): Promise<AlertItemDto[]> {
    return this.alerts.list();
  }
}
