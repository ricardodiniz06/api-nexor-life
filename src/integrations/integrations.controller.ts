import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationStatusDto } from './dto/integration-status.dto';

@ApiTags('integrations')
@ApiBearerAuth('access-token')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  @Get()
  @ApiOperation({
    operationId: 'integrationsList',
    summary: 'Estado das interfaces externas (stub)',
  })
  @ApiOkResponse({ type: [IntegrationStatusDto] })
  list(): Promise<IntegrationStatusDto[]> {
    return this.integrations.list();
  }
}
