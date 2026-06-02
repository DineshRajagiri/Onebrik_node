import { Module } from '@nestjs/common';
import { SmsService } from './services/sms/sms.service';
// import { EmailService } from './services/email.service';
// import { ImageKitService } from './services/imagekit.service';

@Module({
    providers:[
            SmsService,
        // EmailService,
        // ImageKitService
    ],
    exports:[
            SmsService,
        // EmailService,ImageKitService
    ]
})
export class CommonModule {}