import { Injectable } from '@nestjs/common';
import { ReportStubDto } from './dto/report-stub.dto';

@Injectable()
export class ReportsService {
  listStubs(): Promise<ReportStubDto[]> {
    return Promise.resolve([
      {
        id: 'admissions-monthly',
        title: 'Monthly admissions',
        category: 'operations',
      },
      {
        id: 'revenue-summary',
        title: 'Revenue summary',
        category: 'finance',
      },
    ]);
  }
}
