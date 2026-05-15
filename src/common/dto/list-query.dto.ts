import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination-query.dto';

/** Paginação base — `search` e `filter` vêm como string no controller. */
export class ListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Busca: `campo:valor,campo:valor` (contém).',
    example: 'cpf:5466607920,email:546',
  })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtro: `campo:valor,campo:valor` (igualdade exata).',
    example: 'cpf:5466607920,isActive:true',
  })
  filter?: string;
}
