import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PokemonModule } from 'src/domain/pokemon/pokemon.module';
import { PokemonCron } from 'src/domain/pokemon/pokemon.cron';
import { Pokemon } from 'src/domain/pokemon/entities/pokemon.entity';
import { TeamPokemon } from 'src/domain/team/entities/team-pokemon.entity';
import { Team } from 'src/domain/team/entities/team.entity';
import { Trainer } from 'src/domain/trainer/entities/trainer.entity';
import { Address } from 'src/domain/trainer/entities/address.entity';
import { PokeApiService } from 'src/providers/pokeapi/pokeapi.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Pokemon Cron Integration (Testcontainers)', () => {
  let container: StartedPostgreSqlContainer;
  let module: TestingModule;
  let cron: PokemonCron;
  let pokemonRepository: Repository<Pokemon>;

  const mockPokeApiService = {
    listAllPokemon: jest.fn().mockResolvedValue({
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      ],
    }),
  };

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine').start();

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [Pokemon, TeamPokemon, Team, Trainer, Address],
          synchronize: true,
        }),
        PokemonModule,
      ],
    })
      .overrideProvider(PokeApiService).useValue(mockPokeApiService)
      .compile();

    cron = module.get<PokemonCron>(PokemonCron);
    pokemonRepository = module.get<Repository<Pokemon>>(getRepositoryToken(Pokemon));
  }, 60000);

  afterAll(async () => {
    if (module) await module.close();
    if (container) await container.stop();
  });

  it('should sync pokemon data and be idempotent', async () => {
    await cron.syncAllPokemonBasicData();

    let count = await pokemonRepository.count();
    expect(count).toBe(2);

    const bulbasaur = await pokemonRepository.findOneBy({ id: 1 });
    expect(bulbasaur.name).toBe('bulbasaur');

    mockPokeApiService.listAllPokemon.mockResolvedValueOnce({
      results: [
        { name: 'bulbasaur-updated', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
      ],
    });

    await cron.syncAllPokemonBasicData();

    count = await pokemonRepository.count();
    expect(count).toBe(3);

    const updatedBulba = await pokemonRepository.findOneBy({ id: 1 });
    expect(updatedBulba.name).toBe('bulbasaur-updated');
  });
});
