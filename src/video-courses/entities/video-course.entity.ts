import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('video_courses')
export class VideoCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 1 })
  lessons: number;

  @Column({ default: '1h 00m' })
  duration: string;

  @Column({ type: 'float', default: 5.0 })
  rating: number;

  @Column({ default: 10 })
  reviewsCount: number;

  @Column()
  originalPrice: string;

  @Column()
  price: string;

  @Column()
  image: string;

  @Column({ default: 'https://wa.me/6281915237935' })
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
