import { EventTag } from '@clement.pasteau/shared';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Point } from 'geojson';

@Entity('map_zones')
export class MapZoneModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: Point;

  @Column({ type: 'int', default: 1 })
  weight!: number;

  @Column({ type: 'int', default: 500 })
  radius!: number;

  @Index()
  @Column({ type: 'enum', enum: EventTag, default: EventTag.OTHER })
  tag!: EventTag;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
