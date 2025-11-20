import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { vendor, vendorDetails } from 'src/schema/vendor.schema';
import { vendorDTO } from './DTO/vendor.dto';
import { category, categoryDetails } from 'src/schema/category.schema';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { region, regionDetails } from 'src/schema/region.schema';

@Injectable()
export class VendorService {
    constructor(
        @InjectModel(vendor.name) private readonly vendor: Model<vendorDetails>,
        @InjectModel(category.name) private readonly category: Model<categoryDetails>,
        @InjectModel(admin.name) private readonly admin: Model<adminDetails>,
        @InjectModel(region.name) private readonly region: Model<regionDetails>,
    ) { }

    async createVendor(data: vendorDTO, fileUrl?: string) {
        try {

            const exists = await this.vendor.findOne({
                vendorName: data.vendorName,
                isDeleted: false
            });

            if (exists) {
                throw new HttpException(
                    {
                        success: false,
                        message: "Vendor already exists",
                        statusCode: 409,
                        data: null
                    },
                    HttpStatus.CONFLICT
                );
            }

            const adminExists = await this.admin.findById(data.adminId);
            if (!adminExists) {
                throw new HttpException(
                    { success: false, message: "Invalid adminId", statusCode: 400, data: null },
                    HttpStatus.BAD_REQUEST
                );
            }


            const regionExists = await this.region.findById(data.regionId);
            if (!regionExists) {
                throw new HttpException(
                    { success: false, message: "Invalid regionId", statusCode: 400, data: null },
                    HttpStatus.BAD_REQUEST
                );
            }


            const categoryExists = await this.category.findById(data.categoryId);
            if (!categoryExists) {
                throw new HttpException(
                    { success: false, message: "Invalid categoryId", statusCode: 400, data: null },
                    HttpStatus.BAD_REQUEST
                );
            }

            if (fileUrl) {
                data.uploadLogo = fileUrl;
            }

            const createdVendor = await this.vendor.create(data);

            const populatedVendor = await this.vendor
                .findById(createdVendor._id)
                .populate('adminId', 'name')
                .populate('regionId', 'regionName')
                .populate('categoryId', 'categoryName');

            const responseData = {
                // _id: populatedVendor._id,
                vendorDetails: createdVendor,
                adminName: populatedVendor.adminId?.fullName,
                regionName: populatedVendor.regionId?.regionName,
                categoryName: populatedVendor.categoryId?.categoryName,
            };
            return {
                success: true,
                message: "Vendor created successfully",
                statusCode: 201,
                data: responseData
            };

        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Failed to create vendor",
                    statusCode: 400,
                    data: null
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async getAllVendor( page: number = 1, limit: number = 10,search: string = ''
    ) {
        try {
            const skip = (page - 1) * limit;
            const searchFilter = search
                ? {
                    vendorName: {
                        $regex: search,
                        $options: 'i',
                    },
                }
                : {};
            const total = await this.vendor.countDocuments(searchFilter);
            const vendorList = await this.vendor
                .find(searchFilter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate('adminId', 'name email')        
                .populate('regionId', 'regionName city')  
                .populate('categoryId', 'categoryName');; 
            return {
                success: true,
                message: "Vendors fetched successfully",
                statusCode: 200,
                data: {
                    vendor: vendorList,
                    total,
                    page,
                    limit,
                },
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Failed to fetch vendors",
                    statusCode: 400,
                    data: null,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getVendorById(id: string) {
        try {
            const vendor = await this.vendor.findById(id);

            if (!vendor) {
                throw new HttpException(
                    {
                        success: false,
                        message: "Vendor not found",
                        statusCode: 404,
                        data: null
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                message: "Vendor fetched successfully",
                statusCode: 200,
                data: vendor
            };

        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message || "Failed to fetch vendor details",
                    statusCode: 400,
                    data: null
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async updateVendor(
        id: string,
        updateData: Partial<vendorDTO>,
        fileUrl?: string
    ): Promise<{
        success: boolean;
        message: string;
        statusCode: number;
        data?: any;
    }> {
        try {

            if (fileUrl) {
                updateData.uploadLogo = fileUrl;
            }


            const existingVendor = await this.vendor.findById(id);
            if (!existingVendor) {
                return {
                    success: false,
                    message: "Vendor not found",
                    statusCode: 404
                };
            }


            if (updateData.vendorName) {
                const duplicateVendor = await this.vendor.findOne({
                    vendorName: updateData.vendorName,
                    _id: { $ne: id }
                });

                if (duplicateVendor) {
                    return {
                        success: false,
                        message: "Vendor name already exists",
                        statusCode: 409
                    };
                }
            }


            const updatedVendor = await this.vendor.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            return {
                success: true,
                message: "Vendor updated successfully",
                statusCode: 200,
                data: updatedVendor
            };

        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to update vendor",
                statusCode: 400
            };
        }
    }

    async deleteVendor(id: string): Promise<{
        success: boolean;
        message: string;
        statusCode: number
    }> {
        try {
            const vendorData = await this.vendor.findById(id);

            if (!vendorData) {
                return {
                    success: false,
                    message: "Vendor not found",
                    statusCode: 404
                };
            }


            await this.vendor.findByIdAndUpdate(id, {
                isDeleted: true,
                isActive: false
            });

            return {
                success: true,
                message: "Vendor deleted successfully",
                statusCode: 200
            };

        } catch (error) {
            return {
                success: false,
                message: error.message || "Failed to delete vendor",
                statusCode: 400
            };
        }
    }




}
