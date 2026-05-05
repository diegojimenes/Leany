import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddPokemonSchema = z.object({
  pokemonIdOrName: z.union([
    z.string().min(1, 'Nome do Pokémon não pode ser vazio'),
    z.number().int().positive('ID do Pokémon deve ser positivo'),
  ]),
});

export class AddPokemonDto extends createZodDto(AddPokemonSchema) {}
