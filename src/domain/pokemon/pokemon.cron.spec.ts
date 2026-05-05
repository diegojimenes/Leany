import { Test, TestingModule } from '@nestjs/testing';
import { PokemonCron } from './pokemon.cron';
import { PokemonRepository } from './repositories/pokemon.repository';
import { PokeApiService } from '../../providers/pokeapi/pokeapi.service';

describe('PokemonCron', () => {
  let cron: PokemonCron;

  const mockPokemonRepository = {
    exist: jest.fn(),
    save: jest.fn(),
    upsert: jest.fn(),
  };

  const mockPokeApiService = {
    listAllPokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonCron,
        {
          provide: PokemonRepository,
          useValue: mockPokemonRepository,
        },
        { provide: PokeApiService, useValue: mockPokeApiService },
      ],
    }).compile();

    cron = module.get<PokemonCron>(PokemonCron);
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  describe('syncAllPokemonBasicData', () => {
    it('should ignore if listAllPokemon returns null', async () => {
      mockPokeApiService.listAllPokemon.mockResolvedValue(null);
      await cron.syncAllPokemonBasicData();
      expect(mockPokemonRepository.upsert).not.toHaveBeenCalled();
    });

    it('should sync basic pokemon data via upsert', async () => {
      mockPokeApiService.listAllPokemon.mockResolvedValue({
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      });

      await cron.syncAllPokemonBasicData();

      expect(mockPokemonRepository.upsert).toHaveBeenCalledTimes(1);
      expect(mockPokemonRepository.upsert).toHaveBeenCalledWith(
        [
          { id: 1, name: 'bulbasaur' },
          { id: 2, name: 'ivysaur' },
        ],
        ['id'],
      );
    });
  });
});
