import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';
import { Address } from '../entities/address.entity';

@Injectable()
export class TrainerRepository extends Repository<Trainer> {
  constructor(private dataSource: DataSource) {
    super(Trainer, dataSource.createEntityManager());
  }

  async createWithAddress(trainerData: Partial<Trainer>, addressData: Partial<Address> | null): Promise<Trainer> {
    return this.manager.transaction(async (transactionalEntityManager) => {
      const trainer = transactionalEntityManager.create(Trainer, trainerData);
      const savedTrainer = await transactionalEntityManager.save(trainer);

      if (addressData) {
        const address = transactionalEntityManager.create(Address, {
          ...addressData,
          trainer: savedTrainer,
        });
        const savedAddress = await transactionalEntityManager.save(address);
        savedTrainer.addresses = [savedAddress];
      } else {
        savedTrainer.addresses = [];
      }

      return savedTrainer;
    });
  }
}
