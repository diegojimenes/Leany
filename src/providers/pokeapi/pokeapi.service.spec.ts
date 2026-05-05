import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PokeApiService } from './pokeapi.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('PokeApiService', () => {
  let service: PokeApiService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokeApiService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<PokeApiService>(PokeApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPokemon', () => {
    it('should return pokemon data', async () => {
      const data = { id: 1, name: 'bulbasaur' };
      mockHttpService.get.mockReturnValue(of({ data }));

      const result = await service.getPokemon('bulbasaur');
      expect(result).toEqual(data);
    });

    it('should return null on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Not found')),
      );
      const result = await service.getPokemon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('listAllPokemon', () => {
    it('should list all pokemons', async () => {
      const data = { results: [{ name: 'bulbasaur' }] };
      mockHttpService.get.mockReturnValue(of({ data }));

      const result = await service.listAllPokemon(10, 0);
      expect(result).toEqual(data);
    });

    it('should return null on error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Error')),
      );
      const result = await service.listAllPokemon(10, 0);
      expect(result).toBeNull();
    });
  });
});
