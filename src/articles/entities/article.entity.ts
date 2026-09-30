import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'quote';
  content?: string;
  url?: string;
  caption?: string;
  author?: string;
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: 'Parenting & Edukasi' })
  category: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'longtext', nullable: true })
  contentBlocks: string; // JSON string of ContentBlock[]

  @Column({ default: 'Tim Analis JariBakat' })
  author: string;

  @Column({ default: 'Senior Fingerprint & Parenting Consultant' })
  authorRole: string;

  @Column({ default: '4 menit baca' })
  readingTime: string;

  @Column({ default: 'published' })
  status: 'draft' | 'published';

  @Column({ default: 0 })
  views: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
