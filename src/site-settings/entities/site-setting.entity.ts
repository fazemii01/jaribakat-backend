import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSetting {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ default: 'general' })
  group: string;

  @Column({ default: 'text' })
  type: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
