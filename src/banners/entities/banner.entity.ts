import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  desktopImage: string;

  @Column({ nullable: true })
  mobileImage: string;

  @Column({ default: 'Banner JariBakat' })
  alt: string;

  @Column({ default: '/event' })
  ctaHref: string;

  @Column({ default: 'Lihat Paket' })
  ctaText: string;

  @Column({ default: 'Lihat' })
  ctaMobileText: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
