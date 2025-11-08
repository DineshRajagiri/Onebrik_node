import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { vendor, vendorDetails } from 'src/schema/vendor.schema';
import { vendorDTO } from './DTO/vendor.dto';
import { isVendorStatus } from 'src/utils/constants';

@Injectable()
export class VendorService {
    constructor(
        @InjectModel(vendor.name) private readonly vendor: Model<vendorDetails>,
    ) { }
    async createVendor(data: vendorDTO, file?: any) {
        try {
            if (!file) {
                throw new HttpException(
                    {
                        success: false,
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'No file uploaded',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const existingVendor = await this.vendor.findOne({ vendorName: data.vendorName });

            if (existingVendor) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: 'Vendor already exists',
                };
            }

            data.uploadLogo = file;

            const savedVendor = await this.vendor.create(data);

            if (!savedVendor) {
                throw new HttpException(
                    { success: false, message: 'Unable to create vendor' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: 'Vendor created successfully',
                vendor: savedVendor,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async updateVendor(id: string, updateData: Partial<vendorDTO>, file?: Express.Multer.File): Promise<{ success: boolean; message: string; vendor?: vendorDTO }> {
        try {
            const vendor = await this.vendor.findById(id);

            if (!vendor) {
                throw new NotFoundException(`Vendor with ID ${id} not found`);
            }


            const uploadLogoPath = file ? file.path : vendor.uploadLogo;


            const updatedVendor = await this.vendor.findByIdAndUpdate(
                id,
                { ...updateData, uploadLogo: uploadLogoPath },
                { new: true }
            );

            if (!updatedVendor) {
                throw new HttpException(
                    { success: false, message: 'Failed to update Vendor' },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return {
                success: true,
                message: 'Vendor updated successfully',
                vendor: updatedVendor,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Update failed' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async updateVendorStatus(data: any) {
        try {
            const user = await this.vendor.findByIdAndUpdate(data?.userId);

            if (!user) {
                return {
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Vendor not found',
                };
            }

            const updatedUser = await this.vendor.findByIdAndUpdate(
                data?.userId,
                {
                    $set: {
                        vendorStatus: data.status
                    },
                },
                { new: true }
            );

            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Enterprises status added successfully',
                user: updatedUser,
            };
        } catch (e) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: e?.message || 'An error occurred',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async getVendorById(id: string): Promise<{ success: boolean; Vendor: any }> {
        try {
            const Vendor = await this.vendor.findById(id);

            if (!Vendor) {
                throw new HttpException(
                    { success: false, message: 'Enterprise not found' },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                Vendor
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprise details' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // async getAllVendor(
    //     page = 1,
    //     limit = 10,
    //     search = '',
    //     status = ''
    // ): Promise<{
    //     success: boolean;
    //     vendor: any[];
    //     total: number;
    //     activeCount: number;
    //     inactiveCount: number;
    //     page: number;
    //     limit: number;
    // }> {
    //     try {
    //         const skip = (page - 1) * limit;

    //         const searchFilter: any = {};

    //         if (search) {
    //             searchFilter.vendorName = { $regex: search, $options: 'i' };
    //         }

    //         if (status) {
    //             searchFilter.vendorStatus = status;
    //         }

    //         const [vendor, total, activeCount, inactiveCount] = await Promise.all([
    //             this.vendor.find(searchFilter).skip(skip).limit(limit),
    //             this.vendor.countDocuments(),
    //             this.vendor.countDocuments({ vendorStatus: 'Active' }),
    //             this.vendor.countDocuments({ vendorStatus: 'Inactive' })
    //         ]);

    //         return {
    //             success: true,
    //             vendor,
    //             total,
    //             activeCount,
    //             inactiveCount,
    //             page,
    //             limit,
    //         };
    //     } catch (error) {
    //         throw new HttpException(
    //             { success: false, message: error.message || 'Failed to fetch vendors' },
    //             HttpStatus.BAD_REQUEST
    //         );
    //     }
    // }

    async getAllVendor(page = 1, limit = 10, search = '', status = ''): Promise<{ success: boolean; vendor: any[]; total: number; activeCount: number; inactiveCount: number; deletedCount: number; page: number; limit: number; }> {
        try {
            const skip = (page - 1) * limit;

            const searchFilter: any = {};


            if (status === isVendorStatus.DELETED) {
                searchFilter.isDeleted = true;
            } else {
                searchFilter.isDeleted = false;
                if (status === isVendorStatus.ACTIVE) {
                    searchFilter.vendorStatus = isVendorStatus.ACTIVE;
                } else if (status === isVendorStatus.INACTIVE) {
                    searchFilter.vendorStatus = isVendorStatus.INACTIVE;
                }
            }

            if (search) {
                searchFilter.vendorName = { $regex: search, $options: 'i' };
            }

            const [vendor, total, activeCount, inactiveCount, deletedCount] = await Promise.all([
                this.vendor.find(searchFilter).skip(skip).limit(limit),
                this.vendor.countDocuments({ isDeleted: false }),
                this.vendor.countDocuments({ vendorStatus: isVendorStatus.ACTIVE, isDeleted: false }),
                this.vendor.countDocuments({ vendorStatus: isVendorStatus.INACTIVE, isDeleted: false }),
                this.vendor.countDocuments({ isDeleted: true })
            ]);

            return {
                success: true,
                vendor,
                total,
                activeCount,
                inactiveCount,
                deletedCount,
                page,
                limit,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch vendors' },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    async deleteVendor(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const updatedVendor = await this.vendor.findByIdAndUpdate(
                id,
                {
                    isDeleted: true,
                    vendorStatus: isVendorStatus.DELETED
                },
                { new: true }
            );

            if (!updatedVendor) {
                throw new HttpException(
                    { success: false, message: 'Vendor not found' },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                message: 'Vendor deleted successfully (soft delete)',
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to delete Vendor' },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    async vendorList() {
        try {
            const vendor = await this.vendor
                .find({ vendorStatus: 'Active' }, { _id: 1, vendorName: 1 }) // Fetch only active enterprises
                .lean();

            if (!vendor || vendor.length === 0) {
                return {
                    success: true,
                    message: 'No active vendors available',
                    data: [],
                };
            }

            const dropdownList = vendor.map((ent) => ({
                id: ent._id,
                name: ent.vendorName,
            }));

            return {
                success: true,
                message: 'Active Vendor List',
                data: dropdownList,
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error?.message || 'An unexpected error occurred',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    async getvendorStatus(): Promise<{
        success: boolean;
        message: string;
        totalVendors: number;
        activeVendors: number;
        inactiveVendors: number;
        newVendors: number;
    }> {
        try {

            const today = new Date();
            today.setHours(0, 0, 0, 0);


            const [totalVendors, activeVendors, inactiveVendors, newVendors] = await Promise.all([
                this.vendor.countDocuments(), // Count total vendors
                this.vendor.countDocuments({ vendorStatus: 'Active' }),
                this.vendor.countDocuments({ vendorStatus: 'Inactive' }),
                this.vendor.countDocuments({ createdAt: { $gte: today } })
            ]);

            return {
                success: true,
                message: 'Vendor statistics fetched successfully.',
                totalVendors,
                activeVendors,
                inactiveVendors,
                newVendors
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch enterprise statistics.',
                totalVendors: 0,
                activeVendors: 0,
                inactiveVendors: 0,
                newVendors: 0
            };
        }
    }
}
