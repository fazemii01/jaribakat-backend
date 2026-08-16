import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  participantAge: string;

  @Column()
  programType: string; // 'program' | 'online' | 'offline' | 'expert' | 'event'

  @Column()
  programTitle: string;

  @Column({ nullable: true })
  programId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status: RegistrationStatus;

  @Column({ default: false })
  agreedToPolicy: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
