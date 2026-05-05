import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { TeamRepository } from './repositories/team.repository';
import { TeamPokemonRepository } from './repositories/team-pokemon.repository';
import { TrainerService } from '../trainer/trainer.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { BadRequestException } from '@nestjs/common';

describe('TeamService', () => {
  let service: TeamService;

  const mockTeamRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockTeamPokemonRepository = {
    count: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTrainerService = {
    findOne: jest.fn(),
  };
  const mockPokemonService = {
    getPokemon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: TeamRepository, useValue: mockTeamRepository },
        {
          provide: TeamPokemonRepository,
          useValue: mockTeamPokemonRepository,
        },
        { provide: TrainerService, useValue: mockTrainerService },
        { provide: PokemonService, useValue: mockPokemonService },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a team', async () => {
      mockTrainerService.findOne.mockResolvedValue({ id: 'trainer-1' });
      mockTeamRepository.create.mockReturnValue({ name: 'Team 1', trainer: { id: 'trainer-1' } });
      mockTeamRepository.save.mockResolvedValue({ id: 'team-1', name: 'Team 1' });

      const result = await service.create({ name: 'Team 1', trainerId: 'trainer-1' });
      expect(result).toEqual({ id: 'team-1', name: 'Team 1' });
    });
  });

  describe('findAll', () => {
    it('should return all teams', async () => {
      mockTeamRepository.find.mockResolvedValue([{ id: 'team-1' }]);
      expect(await service.findAll()).toEqual([{ id: 'team-1' }]);
    });
  });

  describe('findOne', () => {
    it('should return a team if found', async () => {
      mockTeamRepository.findOne.mockResolvedValue({ id: 'team-1' });
      expect(await service.findOne('team-1')).toEqual({ id: 'team-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockTeamRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('team-invalid')).rejects.toThrow('Time com ID team-invalid não encontrado');
    });
  });

  describe('remove', () => {
    it('should remove a team', async () => {
      const mockTeam = { id: 'team-1' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam as any);
      await service.remove('team-1');
      expect(mockTeamRepository.remove).toHaveBeenCalledWith(mockTeam);
    });
  });

  describe('removePokemon', () => {
    it('should remove pokemon from team', async () => {
      mockTeamPokemonRepository.findOne.mockResolvedValue({ id: 'tp-1' });
      await service.removePokemon('team-1', 25);
      expect(mockTeamPokemonRepository.remove).toHaveBeenCalledWith({ id: 'tp-1' });
    });

    it('should throw if pokemon not in team', async () => {
      mockTeamPokemonRepository.findOne.mockResolvedValue(null);
      await expect(service.removePokemon('team-1', 25)).rejects.toThrow('Pokémon não encontrado neste time.');
    });
  });

  describe('addPokemon', () => {
    it('should throw BadRequestException if team has 5 pokemons', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'team-1',
        teamPokemons: new Array(5).fill({})
      } as any);

      await expect(service.addPokemon('team-1', 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if pokemon already in team', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'team-1',
        teamPokemons: [{ pokemon: { id: 25 } }]
      } as any);
      mockPokemonService.getPokemon.mockResolvedValue({
        id: 25,
        name: 'pikachu',
      });

      await expect(service.addPokemon('team-1', 25)).rejects.toThrow(
        'Este Pokémon já está neste time.',
      );
    });

    it('should add pokemon successfully', async () => {
      const mockTeam: any = { id: 'team-1', teamPokemons: [] };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTeam);
      mockPokemonService.getPokemon.mockResolvedValue({
        id: 25,
        name: 'pikachu',
      });

      const newTeamPokemon = {
        id: 'tp-new',
        team: mockTeam,
        pokemon: { id: 25 },
      };

      mockTeamPokemonRepository.manager = {
        transaction: jest.fn().mockImplementation((cb) => cb({
          create: jest.fn().mockReturnValue(newTeamPokemon),
          save: jest.fn().mockResolvedValue(newTeamPokemon),
        })),
      };

      const result = await service.addPokemon('team-1', 25);

      expect(result.teamPokemons).toHaveLength(1);
      expect(result.teamPokemons[0].pokemon.id).toBe(25);
    });
  });
});
