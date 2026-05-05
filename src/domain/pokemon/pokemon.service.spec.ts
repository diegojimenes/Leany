import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { PokemonRepository } from './repositories/pokemon.repository';
import { PokeApiService } from '../../providers/pokeapi/pokeapi.service';

describe('PokemonService', () => {
  let service: PokemonService;

  const mockPokemonRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPokeApiService = {
    getPokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        {
          provide: PokemonRepository,
          useValue: mockPokemonRepository,
        },
        { provide: PokeApiService, useValue: mockPokeApiService },
      ],
    }).compile();

    service = module.get<PokemonService>(PokemonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPokemon', () => {
    it('should return local pokemon if valid and not expired', async () => {
      const validDate = new Date();
      const mockLocalPokemon = {
        id: 1,
        name: 'bulbasaur',
        sprite: 'sprite.png',
        types: ['grass'],
        lastSyncedAt: validDate,
      };

      mockPokemonRepository.findOneBy.mockResolvedValue(mockLocalPokemon);

      const result = await service.getPokemon(1);

      expect(result).toEqual(mockLocalPokemon);
      expect(mockPokeApiService.getPokemon).not.toHaveBeenCalled();
    });

    it('should fetch from API and update if expired', async () => {
      const expiredDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const mockLocalPokemon = {
        id: 1,
        name: 'bulbasaur',
        sprite: 'sprite.png',
        types: ['grass'],
        lastSyncedAt: expiredDate,
      };

      mockPokemonRepository.findOneBy.mockResolvedValue(mockLocalPokemon);
      mockPokeApiService.getPokemon.mockResolvedValue({
        id: 1,
        name: 'bulbasaur',
        sprites: { front_default: 'new-sprite.png' },
        types: [{ type: { name: 'grass' } }],
      });

      mockPokemonRepository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.getPokemon(1);

      expect(mockPokeApiService.getPokemon).toHaveBeenCalledWith(1);
      expect(mockPokemonRepository.save).toHaveBeenCalled();
      expect(result.sprite).toBe('new-sprite.png');
    });

    it('should fallback to local data if API fails', async () => {
      const expiredDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const mockLocalPokemon = {
        id: 1,
        name: 'bulbasaur',
        sprite: 'sprite.png',
        types: ['grass'],
        lastSyncedAt: expiredDate,
      };

      mockPokemonRepository.findOneBy.mockResolvedValue(mockLocalPokemon);
      mockPokeApiService.getPokemon.mockResolvedValue(null);

      const result = await service.getPokemon(1);

      expect(mockPokeApiService.getPokemon).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLocalPokemon);
    });

    it('should throw error if API fails and no local data', async () => {
      mockPokemonRepository.findOneBy.mockResolvedValue(null);
      mockPokeApiService.getPokemon.mockResolvedValue(null);

      await expect(service.getPokemon(1)).rejects.toThrow(
        'Pokemon 1 not found in PokéAPI',
      );
    });
  });
});
