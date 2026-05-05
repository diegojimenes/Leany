import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddAddressSchema = z.object({
  cep: z
    .string()
    .regex(/^\d+$/, 'CEP deve conter apenas números')
    .length(8, 'CEP deve ter 8 dígitos'),
});

export class AddAddressDto extends createZodDto(AddAddressSchema) {}
