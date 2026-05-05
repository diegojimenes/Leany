import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TeamRepository } from './repositories/team.repository';
import { TeamPokemonRepository } from './repositories/team-pokemon.repository';
import { Team } from './entities/team.entity';
import { TeamPokemon } from './entities/team-pokemon.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { TrainerService } from '../trainer/trainer.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { MAX_POKEMONS_PER_TEAM } from './constants/team.constants';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamPokemonRepository: TeamPokemonRepository,
    private readonly trainerService: TrainerService,
    private readonly pokemonService: PokemonService,
  ) { }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const trainer = await this.trainerService.findOne(createTeamDto.trainerId);

    const team = this.teamRepository.create({
      name: createTeamDto.name,
      trainer,
    });

    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['trainer', 'teamPokemons'],
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['trainer', 'teamPokemons'],
    });

    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado`);
    }

    return team;
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }

  async addPokemon(
    teamId: string,
    pokemonIdOrName: string | number,
  ): Promise<Team> {
    const team = await this.findOne(teamId);


    if (team.teamPokemons && team.teamPokemons.length >= MAX_POKEMONS_PER_TEAM) {
      throw new BadRequestException(`Um time pode ter no máximo ${MAX_POKEMONS_PER_TEAM} Pokémon.`);
    }

    const pokemon = await this.pokemonService.getPokemon(pokemonIdOrName);


    const exists = team.teamPokemons?.some(tp => tp.pokemon.id === pokemon.id);

    if (exists) {
      throw new BadRequestException('Este Pokémon já está neste time.');
    }

    const teamPokemon = await this.teamPokemonRepository.manager.transaction(async (manager) => {
      const tp = manager.create(TeamPokemon, {
        team,
        pokemon,
      });
      return manager.save(tp);
    });

    const { team: _, ...sanitizedTeamPokemon } = teamPokemon as any;
    team.teamPokemons.push(sanitizedTeamPokemon as TeamPokemon);

    return team;
  }

  async removePokemon(teamId: string, pokemonId: number): Promise<void> {
    const teamPokemon = await this.teamPokemonRepository.findOne({
      where: {
        team: { id: teamId },
        pokemon: { id: pokemonId },
      },
    });

    if (!teamPokemon) {
      throw new NotFoundException('Pokémon não encontrado neste time.');
    }

    await this.teamPokemonRepository.remove(teamPokemon);
  }
}
