import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Team } from './team.entity';
import { Pokemon } from '../../pokemon/entities/pokemon.entity';

@Entity('team_pokemons')
@Unique(['team', 'pokemon']) // Impede pokemon duplicado no mesmo time
export class TeamPokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (team) => team.teamPokemons, { onDelete: 'CASCADE' })
  team: Team;

  @ManyToOne(() => Pokemon, { eager: true }) // eager loader para sempre retornar os dados do pokemon
  pokemon: Pokemon;
}
