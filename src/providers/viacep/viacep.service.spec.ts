import { Test, TestingModule } from '@nestjs/testing';
import { ViaCepService } from './viacep.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('ViaCepService', () => {
  let service: ViaCepService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViaCepService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<ViaCepService>(ViaCepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAddressByCep', () => {
    it('should return address', async () => {
      const data = { cep: '01001-000', logradouro: 'Praça da Sé' };
      mockHttpService.get.mockReturnValue(of({ data }));

      const result = await service.getAddressByCep('01001000');
      expect(result).toEqual(data);
    });

    it('should return null if cep not found (erro: true)', async () => {
      mockHttpService.get.mockReturnValue(of({ data: { erro: 'true' } }));
      const result = await service.getAddressByCep('00000000');
      expect(result).toBeNull();
    });

    it('should return null if http request fails', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );
      const result = await service.getAddressByCep('01001000');
      expect(result).toBeNull();
    });
  });
});
