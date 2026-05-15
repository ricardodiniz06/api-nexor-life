import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

/** Responde em `GET /` (fora do prefixo `api/v1`) para evitar 404 no browser. */
@ApiExcludeController()
@Controller()
export class RootController {
  @Public()
  @Get()
  index(): {
    service: string;
    api: string;
    health: string;
    docs: string;
  } {
    return {
      service: 'Nexor Life API',
      api: '/api/v1',
      health: '/api/v1/health',
      docs: '/docs',
    };
  }
}
