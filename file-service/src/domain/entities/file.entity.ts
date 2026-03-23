export class FileEntity {
  id?: string;
  userId!: string;
  originalName!: string;
  minioKey!: string;
  mimeType!: string;
  size!: number;
}
