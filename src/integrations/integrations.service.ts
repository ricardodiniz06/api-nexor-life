import { Injectable } from '@nestjs/common';
import { IntegrationStatusDto } from './dto/integration-status.dto';

@Injectable()
export class IntegrationsService {
  list(): Promise<IntegrationStatusDto[]> {
    return Promise.resolve([
      {
        code: 'fhir',
        name: 'FHIR R4 gateway',
        healthy: true,
        lastSyncAt: null,
      },
      { code: 'hl7', name: 'HL7 v2 listener', healthy: true, lastSyncAt: null },
    ]);
  }
}
