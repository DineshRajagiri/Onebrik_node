import { InjectModel } from '@nestjs/mongoose';
import { deliveryBoy, deliveryBoyDetails } from 'src/schema/deliveryBoy.schema';
import { Model } from 'mongoose';
import { deliveryBoyDTO } from './dto/deliveryBoy.dto';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class DeliveryService {
    constructor(
        @InjectModel(deliveryBoy.name) private readonly deliveryBoys: Model<deliveryBoyDetails>,
    ) { }

    async createDeliveryBoy(data: deliveryBoyDTO, physicalDocumentsUrl?: string, profilePictureUrl?: string) {
        try {
            const exists = await this.deliveryBoys.findOne({
                devlieryBoyName: data.devlieryBoyName,
                isDeleted: false
            });

            if (exists) {
                throw new HttpException(
                    {
                        success: false,
                        message: "DeliveryBoy already exists",
                        statusCode: 409,
                        data: null
                    },
                    HttpStatus.CONFLICT
                );
            }
            if (physicalDocumentsUrl) {
                data.physicalDocuments = physicalDocumentsUrl;
            }
            if (profilePictureUrl) {
                data.profilePicture = profilePictureUrl;
            }

            const created = await this.deliveryBoys.create(data);

            const populated = await this.deliveryBoys
                .findById(created._id)
                .populate("regionId", "regionName city");

            return {
                success: true,
                message: "DeliveryBoy created successfully",
                statusCode: 201,
                data: populated
            };

        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Failed to create DeliveryBoy",
                    statusCode: 400,
                    data: null
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async getAllDeliveryBoys(page: number = 1, limit: number = 10, search: string = ''
    ) {
        try {
            const skip = (page - 1) * limit;
            const searchFilter = search
                ? {
                    devlieryBoyName: {
                        $regex: search,
                        $options: 'i',
                    },
                }
                : {};
            const total = await this.deliveryBoys.countDocuments(searchFilter);
            const deliveryBoys = await this.deliveryBoys
                .find(searchFilter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('regionId', 'regionName city');;
            return {
                success: true,
                message: "deliveryBoys fetched successfully",
                statusCode: 200,
                data: {
                    vendor: deliveryBoys,
                    total,
                    page,
                    limit,
                },
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Failed to fetch deliveryBoys",
                    statusCode: 400,
                    data: null,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getDeliveryBoyId(id: string) {
        try {
            const devlieryBoy = await this.deliveryBoys.findById(id);

            if (!devlieryBoy) {
                throw new HttpException(
                    {
                        success: false,
                        message: "devlieryBoy not found",
                        statusCode: 404,
                        data: null
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                message: "devlieryBoy fetched successfully",
                statusCode: 200,
                data: devlieryBoy
            };

        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Failed to fetch devlieryBoy details",
                    statusCode: 400,
                    data: null
                },
                HttpStatus.BAD_REQUEST
            );
        }


    }

    async updateDeliveryBoy(id: string,updateData: Partial<deliveryBoyDTO>,physicalDocumentsUrl?: string,profilePictureUrl?: string,
    ) {
        try {
            const existing = await this.deliveryBoys.findById(id);

            if (!existing) {
                return {
                    success: false,
                    message: 'Delivery Boy not found',
                    statusCode: 404,
                };
            }

            if (physicalDocumentsUrl)
                updateData.physicalDocuments = physicalDocumentsUrl;

            if (profilePictureUrl)
                updateData.profilePicture = profilePictureUrl;

            const updated = await this.deliveryBoys.findByIdAndUpdate(
                id,
                updateData,
                { new: true },
            );

            return {
                success: true,
                message: 'Delivery Boy updated successfully',
                statusCode: 200,
                data: updated,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to update Delivery Boy',
                statusCode: 400,
            };
        }
    }

    
        async deleteDeliveryBoy(id: string): Promise<{success: boolean;message: string;statusCode: number
        }> {
            try {
                const DeliverBoyData = await this.deliveryBoys.findById(id);
    
                if (!DeliverBoyData) {
                    return {
                        success: false,
                        message: "DeliverBoyData not found",
                        statusCode: 404
                    };
                }
    
    
                await this.deliveryBoys.findByIdAndUpdate(id, {
                    isDeleted: true,
                    isActive: false
                });
    
                return {
                    success: true,
                    message: "deliveryBoy deleted successfully",
                    statusCode: 200
                };
    
            } catch (error) {
                return {
                    success: false,
                    message: error.message || "Failed to delete deliveryBoy",
                    statusCode: 400
                };
            }
        }
}
