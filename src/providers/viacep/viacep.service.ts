import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Injectable()
export class ViaCepService {
  private readonly logger = new Logger(ViaCepService.name);

  constructor(private readonly httpService: HttpService) {}

  async getAddressByCep(cep: string): Promise<ViaCepResponse | null> {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return null;
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get<ViaCepResponse>(
          `https://viacep.com.br/ws/${cleanCep}/json/`,
        ),
      );

      if (response.data.erro) {
        return null;
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching address for CEP ${cleanCep}`,
        error.stack,
      );
      return null;
    }
  }
}
