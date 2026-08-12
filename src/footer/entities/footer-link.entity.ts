import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FooterSection } from './footer-section.entity';

@Entity('footer_links')
export class FooterLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column()
  href: string;

  @Column({ default: false })
  external: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => FooterSection, (section) => section.links, { onDelete: 'CASCADE' })
  section: FooterSection;
}
