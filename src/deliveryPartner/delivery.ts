import { deliveryBoyDTO } from "./dto/deliveryBoy.dto";

export interface IDeliveryBoyService {

    createDeliveryBoy(data: deliveryBoyDTO, physicalDocumentsUrl?: string, profilePictureUrl?: string);
    getDeliveryBoyId(id: string): Promise<{ success: boolean; message: string }>;
    getAllDeliveryBoys(page?: number, limit?: number, search?: string): Promise<{ success: boolean; vendor: any[]; total: number; page: number; limit: number }>;
    updateDeliveryBoy(id: string, updateData: Partial<deliveryBoyDTO>, physicalDocumentsUrl?: string,profilePictureUrl?: string): Promise<{ success: boolean; message: string; statusCode: number; data?: any; }>;
    deleteDeliveryBoy(id: string): Promise<{ success: boolean; message: string; statusCode: number }>;
}