import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Pokemon } from '../entities/pokemon.entity';

@Injectable()
export class PokemonRepository extends Repository<Pokemon> {
  constructor(private dataSource: DataSource) {
    super(Pokemon, dataSource.createEntityManager());
  }
}
