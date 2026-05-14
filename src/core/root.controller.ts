import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';

/** Responde em `GET /` (fora do prefixo `api/v1`) para evitar 404 no browser. */
@ApiTags('root')
@Controller()
export class RootController {
  @Public()
  @Get()
  @ApiOperation({
    operationId: 'rootIndex',
    summary: 'Informação mínima da API',
  })
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
