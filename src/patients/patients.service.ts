import { Injectable } from '@nestjs/common';
import { PatientListResponseDto } from './dto/patient-list.dto';

@Injectable()
export class PatientsService {
  listPlaceholder(): Promise<PatientListResponseDto> {
    return Promise.resolve({
      data: [],
      meta: { total: 0, page: 1, limit: 20 },
    });
  }
}
