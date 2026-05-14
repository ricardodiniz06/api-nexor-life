import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AppSettingsDto } from './dto/app-settings.dto';

@ApiTags('settings')
@ApiBearerAuth('access-token')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({
    operationId: 'settingsGet',
    summary: 'Configurações do tenant (stub)',
  })
  @ApiOkResponse({ type: AppSettingsDto })
  get(): Promise<AppSettingsDto> {
    return this.settings.get();
  }
}
