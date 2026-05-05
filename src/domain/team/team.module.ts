import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamPokemon } from './entities/team-pokemon.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TrainerModule } from '../trainer/trainer.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { TeamRepository } from './repositories/team.repository';
import { TeamPokemonRepository } from './repositories/team-pokemon.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamPokemon]),
    TrainerModule,
    PokemonModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository, TeamPokemonRepository],
  exports: [TeamService, TeamRepository],
})
export class TeamModule {}
