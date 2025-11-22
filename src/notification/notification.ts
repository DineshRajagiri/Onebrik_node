import { User } from "src/schema/user.schema";
import { notification_token_Dto } from "./dto/createnotificationtoken.dto";
export interface INotificationService {
  createNotificationToken(body:notification_token_Dto)
  // sendPush(body:any)
  createNotification(params: any);
  getNotifications(_id: string,author:string);
  deleteNotification(params: any);
  editNotification(params: any);
  UpdateStatus(NotificationId:string,status:any)
  DeleteNotificationToken(notification_token:string)
  getNotifications();
  sendPush(data: { user: string; title: string; body: string }): Promise<void>; // Yeh Add Karna
  create(data: { userId: string; title: string; body: string }): Promise<void>;
}
