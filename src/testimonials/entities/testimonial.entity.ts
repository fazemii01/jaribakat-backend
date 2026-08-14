import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  videoUrl: string;

  @Column()
  thumbnail: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  quote: string;

  @Column({ type: 'float', default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
