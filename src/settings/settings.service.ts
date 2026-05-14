import { Injectable } from '@nestjs/common';
import { AppSettingsDto } from './dto/app-settings.dto';

@Injectable()
export class SettingsService {
  get(): Promise<AppSettingsDto> {
    return Promise.resolve({
      timezone: 'America/Sao_Paulo',
      locale: 'pt-BR',
      features: { alerts: true, integrations: true },
      updatedAt: new Date().toISOString(),
    });
  }
}
