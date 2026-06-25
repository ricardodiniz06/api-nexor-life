import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { type JwtPayload } from '../../iam/authentication/interfaces/jwt-payload.interface';
import { PermissionAction } from '../../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../../iam/authorization/enums/permission-resource.enum';
import { RequirePermissions } from '../../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../iam/authorization/guards/permissions.guard';
import { BrasilApiService } from './brasil-api.service';
import { AddressByCepResponseDto } from './dto/address-by-cep-response.dto';
import { ValidateCnpjResponseDto } from './dto/validate-cnpj-response.dto';

@ApiTags('integrations')
@ApiBearerAuth('access-token')
@Controller('integrations/brasil-api')
@UseGuards(PermissionsGuard)
export class BrasilApiController {
  constructor(private readonly brasilApi: BrasilApiService) {}

  @Get('cep/:cep')
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.CREATE)
  @ApiOperation({
    operationId: 'getAddressByCep',
    summary: 'Consultar endereço por CEP (Brasil API)',
    description:
      'Autopreenche rua, bairro, cidade e estado. Limite de 10 consultas por minuto por usuário.',
  })
  @ApiParam({
    name: 'cep',
    description: 'CEP com ou sem formatação (8 dígitos).',
    example: '01310-930',
  })
  @ApiOkResponse({ type: AddressByCepResponseDto })
  @ApiResponse({ status: 400, description: 'CEP inválido' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado' })
  @ApiResponse({ status: 429, description: 'Limite de consultas excedido' })
  @ApiResponse({ status: 504, description: 'Timeout na consulta' })
  async getAddressByCep(
    @Param('cep') cep: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressByCepResponseDto> {
    return this.brasilApi.getAddressByCep(cep, user.sub);
  }

  @Get('cnpj/:cnpj')
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.CREATE)
  @ApiOperation({
    operationId: 'validateCnpj',
    summary: 'Validar CNPJ de convênio (Brasil API)',
    description:
      'Valida situação cadastral, duplicidade e CNAE. Retorna dados da empresa para autopreenchimento do formulário.',
  })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ com ou sem formatação (14 dígitos).',
    example: '19.131.243/0001-97',
  })
  @ApiOkResponse({ type: ValidateCnpjResponseDto })
  @ApiResponse({ status: 400, description: 'CNPJ inválido ou inativo' })
  @ApiResponse({ status: 409, description: 'CNPJ já cadastrado' })
  @ApiResponse({ status: 404, description: 'CNPJ não encontrado' })
  @ApiResponse({ status: 504, description: 'Timeout na consulta' })
  async validateCnpj(
    @Param('cnpj') cnpj: string,
  ): Promise<ValidateCnpjResponseDto> {
    return this.brasilApi.validateCnpj(cnpj);
  }
}
