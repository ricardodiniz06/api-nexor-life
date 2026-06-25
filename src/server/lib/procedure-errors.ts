import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { RateLimitError } from '../lib/rate-limiter';

export function toBrasilApiHttpException(error: unknown): HttpException {
  if (error instanceof RateLimitError) {
    return new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
  }

  const message = error instanceof Error ? error.message : 'Erro inesperado.';

  if (message.includes('já está cadastrado')) {
    return new ConflictException(message);
  }

  if (
    message.includes('inválido') ||
    message.includes('Digite 8 dígitos') ||
    message.includes('Digite 14 dígitos') ||
    message.includes('inativo na Receita Federal')
  ) {
    return new BadRequestException(message);
  }

  if (message.includes('não encontrado')) {
    return new NotFoundException(message);
  }

  if (message.includes('Tempo limite excedido')) {
    return new GatewayTimeoutException(message);
  }

  if (
    message.includes('Tente novamente mais tarde') ||
    message.includes('Erro ao consultar') ||
    message.includes('Erro ao validar')
  ) {
    return new BadGatewayException(message);
  }

  return new BadGatewayException(message);
}
