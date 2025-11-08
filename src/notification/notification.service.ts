import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
// import * as firebase from 'firebase-admin';
// const { fireBase_ENV_PROD } = require('./config/firebase_key');
//import {fireBase_ENV_PROD} from './config/firebase_key'
//import fireBase_ENV_PROD from '../notification/config/firebase_key';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
// import * as shell from 'shelljs';
import { chunk } from 'lodash';
import { mapLimit } from 'async';
import {
    notification,
    notificationDetails,
    // notificationDetails,
} from 'src/schema/notification.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { notificationToken, notificationTokenDetails } from 'src/schema/notificationToken.schema';
import { notification_token_Dto } from './dto/createnotificationtoken.dto';
// import { firebase } from './config/firebase-init';
import { admin } from './config/firebase-init'; 
export interface ISendFirebaseMessages {
    token: string;
    title?: string;
    message: string;
}
@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(notification.name)
        private notificationModel: Model<notificationDetails>,
        @InjectModel(notificationToken.name)
        private notificationTokenModel: Model<notificationTokenDetails>,
    ) {
   ;
    }
    create(createNotificationDto: CreateNotificationDto) {
        return 'This action adds a new notification';
    }

    public async sendAll(
        messages: admin.messaging.TokenMessage[],
        dryRun?: boolean
    ): Promise<BatchResponse> {
        if (process.env.NODE_ENV === 'local') {
            for (const { notification, token } of messages) {
                // shell.exec(
                //   `echo '{ "aps": { "alert": ${JSON.stringify(notification)}, "token": "${token}" } }' | xcrun simctl push booted com.company.appname -`,
                // );
            }
        }

        // Send messages one by one and collect the response
        const sendPromises = messages.map(async (message) => {
            try {
                const response = await admin.messaging().send({
                    notification: message.notification,
                    token: message.token,
                });
                return { success: true, response }; // Return success with response
            } catch (error) {
                console.error('Error sending message:', error);
                return { success: false, error }; // Return failure with error
            }
        });

        // Wait for all sends to complete
        const sendResults = await Promise.all(sendPromises);

        // Format the response with success and failure counts, and the individual responses
        const successCount = sendResults.filter((res) => res.success).length;
        const failureCount = sendResults.length - successCount;
        const responses = sendResults.map((res) => (res.success ? res.response : res.error));

        return { successCount, failureCount, responses };
    }

    public async sendFirebaseMessages(
        firebaseMessages: ISendFirebaseMessages[],
        dryRun?: boolean,
    ): Promise<BatchResponse> {
        const batchedFirebaseMessages = chunk(firebaseMessages, 500);

        const batchResponses = await mapLimit<
            ISendFirebaseMessages[],
            BatchResponse
        >(
            batchedFirebaseMessages,
            Number(process.env.FIREBASE_PARALLEL_LIMIT),
            async (
                groupedFirebaseMessages: ISendFirebaseMessages[],
            ): Promise<BatchResponse> => {
                try {
                    const tokenMessages: admin.messaging.TokenMessage[] =
                        groupedFirebaseMessages.map(({ message, title, token }) => ({
                            notification: { body: message, title },
                            token,
                            apns: {
                                payload: {
                                    aps: {
                                        'content-available': 1,
                                    },
                                },
                            },
                        }));

                    return await this.sendAll(tokenMessages, dryRun);
                } catch (error) {
                    return {
                        responses: groupedFirebaseMessages.map(() => ({
                            success: false,
                            error,
                        })),
                        successCount: 0,
                        failureCount: groupedFirebaseMessages.length,
                    };
                }
            },
        );

        return batchResponses.reduce(
            ({ responses, successCount, failureCount }, currentResponse) => {
                return {
                    responses: responses.concat(currentResponse.responses),
                    successCount: successCount + currentResponse.successCount,
                    failureCount: failureCount + currentResponse.failureCount,
                };
            },
            {
                responses: [],
                successCount: 0,
                failureCount: 0,
            } as unknown as BatchResponse,
        );
    }
    async createNotificationToken(body: notification_token_Dto): Promise<any> {
        try {
            const token_exist = await this.notificationTokenModel.findOne({ notification_token: body?.notification_token }).lean();
            if (token_exist) {
                return token_exist;
            }

            const object = {
                user: body?.userId,
                notification_token: body?.notification_token
            };

            return await this.notificationTokenModel.create(object);
        } catch (e) {
            console.log(e);
            return null;
        }
    }
    async acceptPushNotification(body: { userId: string, fcmToken: string }) {
        try {
            const object = {

            }

        } catch (e) {
            console.log(e)
        }

    };

    disablePushNotification = async (
        user: any,
        update_dto: UpdateNotificationDto,
    ): Promise<void> => { };

    getNotifications = async (): Promise<any> => { };

    async DeleteNotificationToken(notification_token: string) {
        try {
            const deleteToken = await this.notificationTokenModel.findOneAndDelete({ notification_token })
            if (!deleteToken) {
                return {
                    success: false,
                    message: "Unable to delete FCMToken"
                }
            }
            return {
                success: true,
                message: "FCMToken deleted successfully"
            }
        } catch (e) {
            console.log(e)
        }

    }


    async sendPush(data: { user: string; title: string; body: string }) {
        try {
            const { user, title, body } = data;
            const notifications = await this.notificationTokenModel.find({ user }).lean();
    
            if (!notifications.length) {
                console.warn(`🚫 No tokens found for user: ${user}`);
                return;
            }
    
            const tokens = notifications.map((x) => x.notification_token);
            await this.notificationModel.create({ user, title, body });
    
            // console.log("🔥 Firebase Admin Initialized:", admin.apps.length > 0);
    
            const response = await admin.messaging().sendEachForMulticast({
                notification: { title, body },
                data: { title, body },  
                tokens: tokens,
                android: { priority: "high" },
                apns: { headers: { "apns-priority": "10" } },
            });
            
    
            // console.log("✅ Push Notification Sent:", response);
    
            if (response.failureCount > 0) {
                response.responses.forEach(async (res, index) => {
                    if (!res.success) {
                        console.log("🚫 Invalid Token Deleted:", tokens[index]);
                        // await this.notificationTokenModel.deleteOne({ notification_token: tokens[index] });
                    }
                });
            }
        } catch (error) {
            console.error("❌ Push Notification Error:", error.message);
            console.error("❌ Full Error:", JSON.stringify(error, null, 2));
        }
    }
    
    



}
