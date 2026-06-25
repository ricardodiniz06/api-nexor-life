import { type Repository } from 'typeorm';
import { Convenio } from '../../convenios/entities/convenio.entity';
import { type CnpjResponse } from './brasilApi';
import { cacheSet } from './cache';

export type ValidatedCompanyData = {
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string | null;
  ddd_telefone_1: string;
  cnae_fiscal_descricao: string;
  data_inicio_atividade: string;
  capital_social: number;
  porte: string;
};

export type InsurancePersistence = {
  cnpjExists(cnpj: string): Promise<boolean>;
  saveInsurance(cnpj: string, data: CnpjResponse): Promise<void>;
};

let persistence: InsurancePersistence | null = null;

export function setInsurancePersistence(impl: InsurancePersistence): void {
  persistence = impl;
}

export function getInsurancePersistence(): InsurancePersistence | null {
  return persistence;
}

/**
 * Persistência da tabela `insurances` do spec — mapeada para `convenios` no domínio Nexor Life.
 */
export function createConvenioPersistence(
  repository: Repository<Convenio>,
): InsurancePersistence {
  return {
    async cnpjExists(cnpj: string): Promise<boolean> {
      return repository.exists({ where: { cnpj } });
    },

    saveInsurance(cnpj: string, data: CnpjResponse): Promise<void> {
      cacheSet(`insurance:validated:${cnpj}`, data);
      return Promise.resolve();
    },
  };
}

export function createInMemoryInsurancePersistence(
  existingCnpjs: Set<string> = new Set(),
): InsurancePersistence {
  return {
    cnpjExists(cnpj: string): Promise<boolean> {
      return Promise.resolve(existingCnpjs.has(cnpj));
    },

    saveInsurance(cnpj: string, data: CnpjResponse): Promise<void> {
      existingCnpjs.add(cnpj);
      cacheSet(`insurance:validated:${cnpj}`, data);
      return Promise.resolve();
    },
  };
}
