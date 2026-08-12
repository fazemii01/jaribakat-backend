import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProgramCategory {
  ONLINE = 'online',
  OFFLINE = 'offline',
  EXPERT = 'expert',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  image: string;

  @Column({ default: 'https://wa.me/6285196235285' })
  href: string;

  @Column({
    type: 'enum',
    enum: ProgramCategory,
    default: ProgramCategory.ONLINE,
  })
  category: ProgramCategory;

  @Column({ default: 'Tim Konsultan JariBakat' })
  speaker: string;

  @Column({ default: 'Certified Fingerprint Analyst JariBakat' })
  speakerRole: string;

  @Column({ nullable: true })
  speakerImage: string;

  @Column({ default: 'Akses Fleksibel' })
  date: string;

  @Column({ default: 'Sesuai Jadwal Pilihan' })
  time: string;

  @Column({ default: 'Online / Home Service / Center JariBakat' })
  location: string;

  @Column({ default: 'Rp 350.000' })
  price: string;

  @Column({ nullable: true })
  originalPrice: string;

  @Column({ nullable: true })
  badge: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
