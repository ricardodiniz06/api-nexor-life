import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IListQuery } from '../common/decorators/list-query.decorator';
import {
  PaginatedTypeOrmRepository,
  type PaginatedResult,
} from '../database/pagination';
import { ConveniosErrorMessages } from './common/messages/error-messages';
import { type CreateConvenioDto } from './dto/create-convenio.dto';
import { type UpdateConvenioDto } from './dto/update-convenio.dto';
import { Convenio } from './entities/convenio.entity';
import { CONVENIOS_LIST_CONFIG } from './convenios-list.config';

const MSG = ConveniosErrorMessages;

@Injectable()
export class ConveniosService {
  constructor(
    @InjectRepository(Convenio)
    private readonly convenios: Repository<Convenio>,
    private readonly paginated: PaginatedTypeOrmRepository,
  ) {}

  findAll(query: IListQuery): Promise<PaginatedResult<Convenio>> {
    return this.paginated.findMany(
      this.convenios,
      CONVENIOS_LIST_CONFIG,
      query,
    );
  }

  async findById(id: string): Promise<Convenio | null> {
    return this.convenios.findOne({ where: { id } });
  }

  async create(dto: CreateConvenioDto): Promise<Convenio> {
    const cnpjTaken = await this.convenios.exists({
      where: { cnpj: dto.company.cnpj },
    });
    if (cnpjTaken) {
      throw new ConflictException(MSG.cnpjInUse);
    }

    const convenio = this.convenios.create({
      name: dto.name.trim(),
      cnpj: dto.company.cnpj,
      legalName: dto.company.legalName.trim(),
      tradeName: dto.company.tradeName?.trim() ?? null,
      addressZipCode: dto.address.zipCode,
      addressStreet: dto.address.street.trim(),
      addressNeighborhood: dto.address.neighborhood.trim(),
      addressNumber: dto.address.number.trim(),
      addressComplement: dto.address.complement?.trim() ?? null,
      addressCity: dto.address.city.trim(),
      addressState: dto.address.state,
      additionalData: dto.additionalData ?? null,
      isActive: true,
    });

    return this.convenios.save(convenio);
  }

  async updateById(id: string, dto: UpdateConvenioDto): Promise<Convenio> {
    if (!this.hasUpdateFields(dto)) {
      throw new BadRequestException(MSG.emptyUpdate);
    }

    const convenio = await this.findById(id);
    if (!convenio) {
      throw new NotFoundException(MSG.notFound);
    }

    if (dto.name !== undefined) {
      convenio.name = dto.name.trim();
    }

    if (dto.company?.cnpj !== undefined && dto.company.cnpj !== convenio.cnpj) {
      const other = await this.convenios.findOne({
        where: { cnpj: dto.company.cnpj },
      });
      if (other && other.id !== id) {
        throw new ConflictException(MSG.cnpjInUse);
      }
      convenio.cnpj = dto.company.cnpj;
    }
    if (dto.company?.legalName !== undefined) {
      convenio.legalName = dto.company.legalName.trim();
    }
    if (dto.company?.tradeName !== undefined) {
      convenio.tradeName = dto.company.tradeName?.trim() ?? null;
    }

    if (dto.address?.zipCode !== undefined) {
      convenio.addressZipCode = dto.address.zipCode;
    }
    if (dto.address?.street !== undefined) {
      convenio.addressStreet = dto.address.street.trim();
    }
    if (dto.address?.neighborhood !== undefined) {
      convenio.addressNeighborhood = dto.address.neighborhood.trim();
    }
    if (dto.address?.number !== undefined) {
      convenio.addressNumber = dto.address.number.trim();
    }
    if (dto.address?.complement !== undefined) {
      convenio.addressComplement = dto.address.complement?.trim() ?? null;
    }
    if (dto.address?.city !== undefined) {
      convenio.addressCity = dto.address.city.trim();
    }
    if (dto.address?.state !== undefined) {
      convenio.addressState = dto.address.state;
    }

    if (dto.additionalData !== undefined) {
      convenio.additionalData = dto.additionalData;
    }
    if (dto.isActive !== undefined) {
      convenio.isActive = dto.isActive;
    }

    return this.convenios.save(convenio);
  }

  async removeById(id: string): Promise<void> {
    const convenio = await this.findById(id);
    if (!convenio) {
      throw new NotFoundException(MSG.notFound);
    }
    await this.convenios.remove(convenio);
  }

  private hasUpdateFields(dto: UpdateConvenioDto): boolean {
    const companyFields =
      dto.company !== undefined &&
      (dto.company.cnpj !== undefined ||
        dto.company.legalName !== undefined ||
        dto.company.tradeName !== undefined);

    const addressFields =
      dto.address !== undefined &&
      (dto.address.zipCode !== undefined ||
        dto.address.street !== undefined ||
        dto.address.neighborhood !== undefined ||
        dto.address.number !== undefined ||
        dto.address.complement !== undefined ||
        dto.address.city !== undefined ||
        dto.address.state !== undefined);

    return (
      dto.name !== undefined ||
      companyFields ||
      addressFields ||
      dto.additionalData !== undefined ||
      dto.isActive !== undefined
    );
  }
}
