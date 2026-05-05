import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { PokemonService } from './pokemon.service';
import { PokemonCron } from './pokemon.cron';
import { PokeApiModule } from '../../providers/pokeapi/pokeapi.module';
import { PokemonRepository } from './repositories/pokemon.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Pokemon]), PokeApiModule],
  providers: [PokemonService, PokemonCron, PokemonRepository],
  exports: [PokemonService, PokemonRepository],
})
export class PokemonModule {}
