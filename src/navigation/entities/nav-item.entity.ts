import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NavChild } from './nav-child.entity';

@Entity('nav_items')
export class NavItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  href: string;

  @Column({ default: 'navbar' }) // 'navbar' | 'mobile_bottom'
  type: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => NavChild, (child) => child.parent, { cascade: true, eager: true })
  children: NavChild[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
