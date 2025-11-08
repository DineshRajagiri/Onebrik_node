// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
const ImageKit = require('imagekit');
// import imageKitConfig from './imagekit.config';

@Injectable()
export class ImageKitService {
  private readonly imageKit;

  constructor() {
    // Create a nodemailer transporter using your email service provider settings
    this.imageKit = new ImageKit({
    //   publicKey: imageKitConfig.publicKey,
    //   privateKey: imageKitConfig.privateKey,
    //   urlEndpoint: imageKitConfig.urlEndpoint,
    });
  }
  async upload(file, id) {
    return await this.imageKit.upload({
      file: file.buffer,
      fileName: Date.now() + file.originalname,
      folder: id,
    });
  }
  async multiFileUpload(files, id) {
    let fileArray = [];

    for await (const iterator of files) {
      let fileName = iterator.originalname.split(".")
      const result = await this.imageKit.upload({
        file: iterator.buffer,
        fileName:Date.now()+"."+fileName[fileName.length-1],
        folder: id,
      });
      if (!result) {
        continue;
      }

      fileArray.push(result?.url);
    }
    return {
      success: true,
      fileArray,
    };
  }
}
