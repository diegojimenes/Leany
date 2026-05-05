export class PokemonResponseDto {
  id: number;
  name: string;
  sprite?: string;
  types: string[];
}

export class TeamPokemonResponseDto {
  id: string;
  pokemon: PokemonResponseDto;
}

export class TeamResponseDto {
  id: string;
  name: string;
  trainer: {
    id: string;
    name: string;
  };
  pokemons: TeamPokemonResponseDto[];
}
