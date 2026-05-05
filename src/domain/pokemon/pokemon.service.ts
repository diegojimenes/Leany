import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PokeApiService } from '../../providers/pokeapi/pokeapi.service';
import { PokemonRepository } from './repositories/pokemon.repository';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private readonly TTL_DAYS = 7;

  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService,
  ) {}

  async getPokemon(idOrName: string | number): Promise<Pokemon> {
    const isNumber = !isNaN(Number(idOrName));
    const localPokemon = await this.pokemonRepository.findOneBy(
      isNumber ? { id: Number(idOrName) } : { name: String(idOrName).toLowerCase() }
    );

    if (localPokemon && !this.needsSync(localPokemon)) {
      return localPokemon;
    }

    return this.syncFromApi(idOrName, localPokemon);
  }

  private needsSync(localPokemon: Pokemon | null): boolean {
    if (!localPokemon) return true;
    if (!localPokemon.sprite || !localPokemon.types) return true;
    
    if (localPokemon.lastSyncedAt) {
      const diffTime = Math.abs(new Date().getTime() - localPokemon.lastSyncedAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= this.TTL_DAYS) return true;
    } else {
      return true;
    }
    
    return false;
  }

  private async syncFromApi(idOrName: string | number, localPokemon: Pokemon | null): Promise<Pokemon> {
    const apiData = await this.pokeApiService.getPokemon(idOrName);
    if (!apiData) {
      if (localPokemon) {
        this.logger.warn(`Failed to sync pokemon ${idOrName}, using stale local data`);
        return localPokemon;
      }
      throw new NotFoundException(`Pokemon ${idOrName} not found in PokéAPI`);
    }

    const types = apiData.types.map((t) => t.type.name);
    const now = new Date();

    if (localPokemon) {
      localPokemon.name = apiData.name;
      localPokemon.sprite = apiData.sprites?.front_default;
      localPokemon.types = types;
      localPokemon.lastSyncedAt = now;
      return this.pokemonRepository.save(localPokemon);
    } else {
      const newPokemon = this.pokemonRepository.create({
        id: apiData.id,
        name: apiData.name,
        sprite: apiData.sprites?.front_default,
        types,
        lastSyncedAt: now,
      });
      return this.pokemonRepository.save(newPokemon);
    }
  }
}
