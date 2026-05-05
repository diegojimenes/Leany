import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateTrainerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cep: z
    .string()
    .regex(/^\d+$/, 'CEP deve conter apenas números')
    .length(8, 'CEP deve ter 8 dígitos')
    .optional(),
});

export class CreateTrainerDto extends createZodDto(CreateTrainerSchema) {}
