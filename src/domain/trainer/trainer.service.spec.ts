import { Test, TestingModule } from '@nestjs/testing';
import { TrainerService } from './trainer.service';
import { TrainerRepository } from './repositories/trainer.repository';
import { AddressRepository } from './repositories/address.repository';
import { ViaCepService } from '../../providers/viacep/viacep.service';
import { ConflictException } from '@nestjs/common';

describe('TrainerService', () => {
  let service: TrainerService;

  const mockTrainerRepository = {
    findOne: jest.fn(),
    softDelete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createWithAddress: jest.fn(),
  };

  const mockAddressRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockViaCepService = {
    getAddressByCep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainerService,
        {
          provide: TrainerRepository,
          useValue: mockTrainerRepository,
        },
        {
          provide: AddressRepository,
          useValue: mockAddressRepository,
        },
        { provide: ViaCepService, useValue: mockViaCepService },
      ],
    }).compile();

    service = module.get<TrainerService>(TrainerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trainer', async () => {
      mockTrainerRepository.createWithAddress.mockResolvedValue({ id: 'trainer-1', name: 'Ash' });

      expect(await service.create({ name: 'Ash' })).toEqual({ id: 'trainer-1', name: 'Ash' });
    });
  });

  describe('findAll', () => {
    it('should return all trainers', async () => {
      mockTrainerRepository.find.mockResolvedValue([{ id: 'trainer-1' }]);
      expect(await service.findAll()).toEqual([{ id: 'trainer-1' }]);
    });
  });

  describe('findOne', () => {
    it('should return a trainer if found', async () => {
      mockTrainerRepository.findOne.mockResolvedValue({ id: 'trainer-1' });
      expect(await service.findOne('trainer-1')).toEqual({ id: 'trainer-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockTrainerRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow('Treinador com ID invalid não encontrado');
    });
  });

  describe('addAddress', () => {
    it('should add address to trainer', async () => {
      const mockTrainer = { id: 'trainer-1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTrainer as any);
      mockViaCepService.getAddressByCep.mockResolvedValue({
        cep: '01001-000', logradouro: 'Rua A', bairro: 'Bairro B', localidade: 'Cidade', uf: 'SP',
      });
      mockAddressRepository.create.mockReturnValue({ logradouro: 'Rua A', trainer: mockTrainer });
      mockAddressRepository.save.mockResolvedValue({ id: 'address-1', logradouro: 'Rua A' });

      const result = await service.addAddress('trainer-1', '01001000');
      expect(result.id).toEqual('address-1');
      expect(mockViaCepService.getAddressByCep).toHaveBeenCalledWith('01001000');
    });
  });

  describe('remove', () => {
    it('should throw ConflictException if trainer has active teams', async () => {
      mockTrainerRepository.findOne.mockResolvedValue({
        id: 'trainer-1',
        teams: [{ id: 'team-1' }],
      });

      await expect(service.remove('trainer-1')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.remove('trainer-1')).rejects.toThrow(
        'Não é possível excluir um treinador que possui times ativos. Remova os times primeiro.',
      );
    });

    it('should remove trainer if no teams', async () => {
      mockTrainerRepository.findOne.mockResolvedValue({
        id: 'trainer-1',
        teams: [],
      });
      mockTrainerRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('trainer-1');
      expect(mockTrainerRepository.softDelete).toHaveBeenCalledWith(
        'trainer-1',
      );
    });
  });
});
