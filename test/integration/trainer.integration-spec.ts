import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TrainerModule } from 'src/domain/trainer/trainer.module';
import { TrainerService } from 'src/domain/trainer/trainer.service';
import { Trainer } from 'src/domain/trainer/entities/trainer.entity';
import { Address } from 'src/domain/trainer/entities/address.entity';
import { Team } from 'src/domain/team/entities/team.entity';
import { TeamPokemon } from 'src/domain/team/entities/team-pokemon.entity';
import { Pokemon } from 'src/domain/pokemon/entities/pokemon.entity';
import { ViaCepService } from 'src/providers/viacep/viacep.service';

describe('Trainer Integration (Testcontainers)', () => {
  let container: StartedPostgreSqlContainer;
  let module: TestingModule;
  let service: TrainerService;

  const mockViaCepService = {
    getAddressByCep: jest.fn().mockResolvedValue({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    }),
  };

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_pass')
      .start();

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
        TrainerModule,
      ],
    })
      .overrideProvider(ViaCepService)
      .useValue(mockViaCepService)
      .compile();

    service = module.get<TrainerService>(TrainerService);
  }, 60000);

  afterAll(async () => {
    if (module) await module.close();
    if (container) await container.stop();
  });

  it('should create a trainer with an address in a single transaction', async () => {
    const trainerName = 'Ash Ketchum';
    const cep = '01001000';

    const result = await service.create({
      name: trainerName,
      cep: cep,
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe(trainerName);
    expect(result.addresses).toHaveLength(1);
    expect(result.addresses[0].cep).toBe('01001000');
    expect(result.addresses[0].city).toBe('São Paulo');
  });

  it('should rollback trainer creation if address data is invalid (Transaction Test)', async () => {
    mockViaCepService.getAddressByCep.mockResolvedValueOnce(null);

    await expect(service.create({
      name: 'Invalid Trainer',
      cep: '00000000',
    })).rejects.toThrow('CEP inválido ou não encontrado.');

    const trainers = await service.findAll();
    const invalidTrainer = trainers.find(t => t.name === 'Invalid Trainer');
    expect(invalidTrainer).toBeUndefined();
  });
});
