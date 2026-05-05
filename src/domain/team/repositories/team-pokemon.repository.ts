import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TeamPokemon } from '../entities/team-pokemon.entity';

@Injectable()
export class TeamPokemonRepository extends Repository<TeamPokemon> {
  constructor(private dataSource: DataSource) {
    super(TeamPokemon, dataSource.createEntityManager());
  }
}
