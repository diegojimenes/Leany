import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PokeApiService } from '../../providers/pokeapi/pokeapi.service';
import { PokemonRepository } from './repositories/pokemon.repository';

@Injectable()
export class PokemonCron {
  private readonly logger = new Logger(PokemonCron.name);

  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async syncAllPokemonBasicData() {
    this.logger.log('Starting mass synchronization of basic Pokemon data...');
    try {
      const listResponse = await this.pokeApiService.listAllPokemon();
      if (!listResponse || !listResponse.results) {
        this.logger.warn('Failed to retrieve pokemon list from API.');
        return;
      }

      this.logger.log(`Found ${listResponse.results.length} pokemons to sync.`);

      const pokemonsToUpsert = [];

      for (const result of listResponse.results) {
        const idMatch = result.url.match(/\/pokemon\/(\d+)\//);
        if (!idMatch) continue;

        const id = parseInt(idMatch[1], 10);
        pokemonsToUpsert.push({
          id,
          name: result.name,
        });
      }

      if (pokemonsToUpsert.length > 0) {
        await this.pokemonRepository.upsert(pokemonsToUpsert, ['id']);
      }

      this.logger.log(
        `Synchronization finished. ${pokemonsToUpsert.length} pokemons upserted.`,
      );
    } catch (error) {
      this.logger.error('Error during pokemon synchronization', error.stack);
    }
  }
}
