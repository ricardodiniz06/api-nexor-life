import { Injectable } from '@nestjs/common';
import { AlertItemDto } from './dto/alert-item.dto';

@Injectable()
export class AlertsService {
  list(): Promise<AlertItemDto[]> {
    return Promise.resolve([]);
  }
}
