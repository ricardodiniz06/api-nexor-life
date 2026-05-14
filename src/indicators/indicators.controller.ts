import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { IndicatorStubDto } from './dto/indicator-stub.dto';

@ApiTags('indicators')
@ApiBearerAuth('access-token')
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicators: IndicatorsService) {}

  @Get()
  @ApiOperation({
    operationId: 'indicatorsList',
    summary: 'Indicadores de qualidade e operação (stub)',
  })
  @ApiOkResponse({ type: [IndicatorStubDto] })
  list(): Promise<IndicatorStubDto[]> {
    return this.indicators.list();
  }
}
