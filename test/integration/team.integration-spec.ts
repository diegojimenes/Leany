import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TeamModule } from 'src/domain/team/team.module';
import { TeamService } from 'src/domain/team/team.service';
import { PokemonService } from 'src/domain/pokemon/pokemon.service';
import { TrainerService } from 'src/domain/trainer/trainer.service';
import { Trainer } from 'src/domain/trainer/entities/trainer.entity';
import { Address } from 'src/domain/trainer/entities/address.entity';
import { Team } from 'src/domain/team/entities/team.entity';
import { TeamPokemon } from 'src/domain/team/entities/team-pokemon.entity';
import { Pokemon } from 'src/domain/pokemon/entities/pokemon.entity';
import { PokeApiService } from 'src/providers/pokeapi/pokeapi.service';
import { MAX_POKEMONS_PER_TEAM } from 'src/domain/team/constants/team.constants';

describe('Team Integration (Testcontainers)', () => {
  let container: StartedPostgreSqlContainer;
  let module: TestingModule;
  let teamService: TeamService;
  let trainerService: TrainerService;
  let pokemonService: PokemonService;

  const mockPokeApiService = {
    getPokemon: jest.fn().mockImplementation((id) => Promise.resolve({
      id: Number(id),
      name: `pokemon-${id}`,
      sprites: { front_default: 'sprite-url' },
      types: [{ type: { name: 'fire' } }],
    })),
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
          entities: [Trainer, Address, Team, TeamPokemon, Pokemon],
          synchronize: true,
        }),
        TeamModule,
      ],
    })
      .overrideProvider(PokeApiService).useValue(mockPokeApiService)
      .compile();

    teamService = module.get<TeamService>(TeamService);
    trainerService = module.get<TrainerService>(TrainerService);
    pokemonService = module.get<PokemonService>(PokemonService);
  }, 60000);

  afterAll(async () => {
    if (module) await module.close();
    if (container) await container.stop();
  });

  it('should add a pokemon to a team and enforce limits', async () => {
    const trainer = await trainerService.create({ name: 'Red' });
    const team = await teamService.create({ name: 'Alpha', trainerId: trainer.id });

    for (let i = 1; i <= MAX_POKEMONS_PER_TEAM; i++) {
      await teamService.addPokemon(team.id, i);
    }

    const fullTeam = await teamService.findOne(team.id);
    expect(fullTeam.teamPokemons).toHaveLength(5);

    await expect(teamService.addPokemon(team.id, 6))
      .rejects.toThrow(`Um time pode ter no máximo ${MAX_POKEMONS_PER_TEAM} Pokémon.`);
  });

  it('should not allow duplicate pokemon in the same team', async () => {
    const trainer = await trainerService.create({ name: 'Blue' });
    const team = await teamService.create({ name: 'Beta', trainerId: trainer.id });

    await teamService.addPokemon(team.id, 25);

    await expect(teamService.addPokemon(team.id, 25))
      .rejects.toThrow('Este Pokémon já está neste time.');
  });
});
