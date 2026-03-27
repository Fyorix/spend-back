import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('files')
export class FileModel {
  @PrimaryGeneratedColumn('uuid')
  id: string = randomUUID();

  @Column()
  userId!: string;

  @Column()
  originalName!: string;

  @Column()
  minioKey!: string;

  @Column()
  mimeType!: string;

  @Column()
  size!: number;

  @Column()
  status!: string;
}
