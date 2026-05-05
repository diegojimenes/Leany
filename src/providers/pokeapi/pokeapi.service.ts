import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

export interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

@Injectable()
export class PokeApiService {
  private readonly logger = new Logger(PokeApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async getPokemon(idOrName: string | number): Promise<PokeApiPokemon | null> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<PokeApiPokemon>(
          `https://pokeapi.co/api/v2/pokemon/${idOrName}`,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching pokemon ${idOrName} from PokeAPI`,
        error.message,
      );
      return null;
    }
  }

  async listAllPokemon(
    limit = 10000,
    offset = 0,
  ): Promise<PokeApiListResponse | null> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<PokeApiListResponse>(
          `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error listing pokemon from PokeAPI`,
        error.message,
      );
      return null;
    }
  }
}
