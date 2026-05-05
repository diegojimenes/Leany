import { Team } from '../entities/team.entity';
import { TeamResponseDto } from '../dto/team-response.dto';

export class TeamMapper {
  static toDto(team: Team): TeamResponseDto | null {
    if (!team) return null;

    return {
      id: team.id,
      name: team.name,
      trainer: team.trainer
        ? {
          id: team.trainer.id,
          name: team.trainer.name,
        }
        : { id: '', name: 'Desconhecido' },
      pokemons: (team.teamPokemons || [])
        .filter(tp => tp.pokemon)
        .map((tp) => ({
          id: tp.id,
          pokemon: {
            id: tp.pokemon!.id,
            name: tp.pokemon!.name,
            sprite: tp.pokemon!.sprite || '',
            types: tp.pokemon!.types || [],
          },
        })),
    };
  }

  static toDtoList(teams: Team[]): TeamResponseDto[] {
    return (teams || [])
      .map((team) => this.toDto(team))
      .filter((dto): dto is TeamResponseDto => dto !== null);
  }
}
