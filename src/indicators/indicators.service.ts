import { Injectable } from '@nestjs/common';
import { IndicatorStubDto } from './dto/indicator-stub.dto';

@Injectable()
export class IndicatorsService {
  list(): Promise<IndicatorStubDto[]> {
    return Promise.resolve([
      {
        code: 'HAI_RATE',
        label: 'Hospital-associated infection rate',
        value: null,
        unit: '%',
      },
      {
        code: 'READMIT_30',
        label: '30-day readmissions',
        value: null,
        unit: '%',
      },
    ]);
  }
}
