import { Module } from '@nestjs/common';
// import { EmailService } from './services/email.service';
// import { ImageKitService } from './services/imagekit.service';

@Module({
    providers:[
        // EmailService,
        // ImageKitService
    ],
    exports:[
        // EmailService,ImageKitService
    ]
})
export class CommonModule {}