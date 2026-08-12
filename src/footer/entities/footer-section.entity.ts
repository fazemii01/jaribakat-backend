import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FooterLink } from './footer-link.entity';

@Entity('footer_sections')
export class FooterSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => FooterLink, (link) => link.section, { cascade: true, eager: true })
  links: FooterLink[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
