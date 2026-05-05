import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('pokemon')
export class Pokemon {
  @PrimaryColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  types: string[];

  @Column({ nullable: true })
  sprite: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
