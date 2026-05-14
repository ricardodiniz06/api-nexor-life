import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportStubDto } from './dto/report-stub.dto';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get()
  @ApiOperation({
    operationId: 'reportsListStubs',
    summary: 'Definições de relatórios disponíveis (stub)',
  })
  @ApiOkResponse({ type: [ReportStubDto] })
  list(): Promise<ReportStubDto[]> {
    return this.reports.listStubs();
  }
}
