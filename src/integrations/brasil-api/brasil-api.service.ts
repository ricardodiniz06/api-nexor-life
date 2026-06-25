import { Injectable } from '@nestjs/common';
import {
  getAddressByCep,
  type AddressResult,
} from '../../server/procedures/address';
import {
  validateCnpj,
  type ValidateCnpjResult,
} from '../../server/procedures/insurance';
import { toBrasilApiHttpException } from '../../server/lib/procedure-errors';

@Injectable()
export class BrasilApiService {
  async getAddressByCep(cep: string, userId: string): Promise<AddressResult> {
    try {
      return await getAddressByCep(cep, { userId });
    } catch (error) {
      throw toBrasilApiHttpException(error);
    }
  }

  async validateCnpj(cnpj: string): Promise<ValidateCnpjResult> {
    try {
      return await validateCnpj(cnpj);
    } catch (error) {
      throw toBrasilApiHttpException(error);
    }
  }
}
