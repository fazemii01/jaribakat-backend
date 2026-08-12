import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { NavItem } from './nav-item.entity';

@Entity('nav_children')
export class NavChild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column()
  href: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  iconBg: string;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => NavItem, (item) => item.children, { onDelete: 'CASCADE' })
  parent: NavItem;
}
