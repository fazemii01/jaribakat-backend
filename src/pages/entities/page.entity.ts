import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  heroBadge: string;

  @Column({ nullable: true })
  heroTitle: string;

  @Column({ type: 'text', nullable: true })
  heroDescription: string;

  @Column({ nullable: true })
  heroImage: string;

  @Column({ type: 'longtext', nullable: true })
  bodyContent: string;

  @Column({ nullable: true })
  ctaText: string;

  @Column({ nullable: true })
  ctaHref: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
