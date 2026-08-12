import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EventCategory {
  ONLINE = 'online',
  OFFLINE = 'offline',
  EXPERT = 'expert',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: EventCategory,
    default: EventCategory.ONLINE,
  })
  category: EventCategory;

  @Column()
  speaker: string;

  @Column()
  speakerRole: string;

  @Column()
  speakerImage: string;

  @Column({ default: 'Akses Fleksibel' })
  date: string;

  @Column({ default: 'Sesuai Jadwal Pilihan' })
  time: string;

  @Column({ default: 'Online / Center JariBakat' })
  location: string;

  @Column()
  image: string;

  @Column()
  price: string;

  @Column({ nullable: true })
  originalPrice: string;

  @Column({ nullable: true })
  badge: string;

  @Column({ default: 'https://wa.me/6285196235285' })
  href: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
