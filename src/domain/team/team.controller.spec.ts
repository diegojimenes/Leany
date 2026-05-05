import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

describe('TeamController', () => {
  let controller: TeamController;

  const mockTeamService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    addPokemon: jest.fn(),
    removePokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [{ provide: TeamService, useValue: mockTeamService }],
    }).compile();

    controller = module.get<TeamController>(TeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a team', async () => {
    const dto = { name: 'Team 1', trainerId: 'uuid' };
    mockTeamService.create.mockResolvedValue({ id: '1', ...dto });
    expect(await controller.create(dto)).toEqual({
      id: '1',
      name: 'Team 1',
      trainer: { id: '', name: 'Desconhecido' },
      pokemons: [],
    });
    expect(mockTeamService.create).toHaveBeenCalledWith(dto);
  });

  it('should add pokemon', async () => {
    const dto = { pokemonIdOrName: 25 };
    mockTeamService.addPokemon.mockResolvedValue({
      id: '1',
      name: 'Team 1',
      teamPokemons: [],
    });
    expect(await controller.addPokemon('1', dto)).toEqual({
      id: '1',
      name: 'Team 1',
      trainer: { id: '', name: 'Desconhecido' },
      pokemons: [],
    });
    expect(mockTeamService.addPokemon).toHaveBeenCalledWith('1', 25);
  });
});
