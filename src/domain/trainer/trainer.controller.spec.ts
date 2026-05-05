import { Test, TestingModule } from '@nestjs/testing';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';

describe('TrainerController', () => {
  let controller: TrainerController;

  const mockTrainerService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    addAddress: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainerController],
      providers: [{ provide: TrainerService, useValue: mockTrainerService }],
    }).compile();

    controller = module.get<TrainerController>(TrainerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a trainer', async () => {
    const dto = { name: 'Ash' };
    mockTrainerService.create.mockResolvedValue({ id: '1', ...dto });
    expect(await controller.create(dto)).toEqual({ id: '1', ...dto });
  });

  it('should add address', async () => {
    const dto = { cep: '01001000' };
    mockTrainerService.addAddress.mockResolvedValue({
      id: 'addr-1',
      cep: dto.cep,
    });
    expect(await controller.addAddress('1', dto)).toEqual({
      id: 'addr-1',
      cep: dto.cep,
    });
    expect(mockTrainerService.addAddress).toHaveBeenCalledWith('1', dto.cep);
  });
});
