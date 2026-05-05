import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TrainerRepository } from './repositories/trainer.repository';
import { AddressRepository } from './repositories/address.repository';
import { Trainer } from './entities/trainer.entity';
import { Address } from './entities/address.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { ViaCepService } from '../../providers/viacep/viacep.service';

@Injectable()
export class TrainerService {
  constructor(
    private readonly trainerRepository: TrainerRepository,
    private readonly addressRepository: AddressRepository,
    private readonly viaCepService: ViaCepService,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    let addressData = null;

    if (createTrainerDto.cep) {
      const viaCepData = await this.viaCepService.getAddressByCep(createTrainerDto.cep);
      if (!viaCepData) {
        throw new BadRequestException('CEP inválido ou não encontrado.');
      }
      addressData = {
        cep: viaCepData.cep.replace('-', ''),
        street: viaCepData.logradouro,
        neighborhood: viaCepData.bairro,
        city: viaCepData.localidade,
        state: viaCepData.uf,
      };
    }

    return this.trainerRepository.createWithAddress(
      { name: createTrainerDto.name },
      addressData,
    );
  }

  async findAll(): Promise<Trainer[]> {
    return this.trainerRepository.find();
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['addresses', 'teams'],
    });
    if (!trainer) {
      throw new NotFoundException(`Treinador com ID ${id} não encontrado`);
    }
    return trainer;
  }

  async remove(id: string): Promise<void> {
    const trainer = await this.findOne(id);

    if (trainer.teams && trainer.teams.length > 0) {
      throw new ConflictException(
        'Não é possível excluir um treinador que possui times ativos. Remova os times primeiro.',
      );
    }

    await this.trainerRepository.softDelete(id);
  }

  async addAddress(trainerId: string, cep: string): Promise<Address> {
    const trainer = await this.findOne(trainerId);

    const viaCepData = await this.viaCepService.getAddressByCep(cep);
    if (!viaCepData) {
      throw new BadRequestException('CEP inválido ou não encontrado.');
    }

    const address = this.addressRepository.create({
      cep: viaCepData.cep.replace('-', ''),
      street: viaCepData.logradouro,
      neighborhood: viaCepData.bairro,
      city: viaCepData.localidade,
      state: viaCepData.uf,
      trainer,
    });

    return this.addressRepository.save(address);
  }
}
