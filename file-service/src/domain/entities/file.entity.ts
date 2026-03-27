export enum FileStatus {
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class FileEntity {
  id?: string;
  userId!: string;
  originalName!: string;
  minioKey!: string;
  mimeType!: string;
  size!: number;
  status?: FileStatus;
}
