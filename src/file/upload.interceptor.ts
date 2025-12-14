import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export function UploadInterceptor(folder: string) {
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: `./uploads/${folder}`,
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        cb(null, `${unique}.${ext}`);
      },
    }),
  });
}
