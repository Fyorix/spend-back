import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Point } from 'geojson';

@Entity('geolocalisations')
export class GeolocalisationModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_id', unique: true })
  transactionId!: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: Point;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
