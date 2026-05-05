import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from './entities/trainer.entity';
import { Address } from './entities/address.entity';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { ViaCepModule } from '../../providers/viacep/viacep.module';
import { TrainerRepository } from './repositories/trainer.repository';
import { AddressRepository } from './repositories/address.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer, Address]), ViaCepModule],
  controllers: [TrainerController],
  providers: [TrainerService, TrainerRepository, AddressRepository],
  exports: [TrainerService, TrainerRepository],
})
export class TrainerModule {}
