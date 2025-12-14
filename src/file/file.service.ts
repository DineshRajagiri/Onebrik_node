import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {

    
  getFileUrl(req: any, file: Express.Multer.File, folder: string): string {
    return `${req.protocol}://${req.get('host')}/uploads/${folder}/${file.filename}`;
  }
}
