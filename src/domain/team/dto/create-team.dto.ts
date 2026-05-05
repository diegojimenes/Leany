import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateTeamSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  trainerId: z.string().uuid('ID de treinador inválido'),
});

export class CreateTeamDto extends createZodDto(CreateTeamSchema) {}
