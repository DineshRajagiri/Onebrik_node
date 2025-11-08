import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { enterprise, EnterpriseDocument } from 'src/schema/enterprise.schema';
import { Model } from 'mongoose';
import { enterpriseDTO } from './DTO/enterprise.dto';
import { isEnterpriseStatus } from 'src/utils/constants';

@Injectable()
export class EnterpriseService {
    constructor(
        @InjectModel(enterprise.name) private readonly enterprise: Model<EnterpriseDocument>,
    ) { }
    async createEnterprise(data: enterpriseDTO, file?: any) {
        try {
            // Check if a file was uploaded
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

            const existingEnterprise = await this.enterprise.findOne({ enterpriseName: data.enterpriseName });

            if (existingEnterprise) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: 'Enterprise already exists',
                };
            }


            data.uploadLogo = file;


            const savedEnterprise = await this.enterprise.create(data);

            if (!savedEnterprise) {
                throw new HttpException(
                    { success: false, message: 'Unable to create enterprise' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: 'Enterprise created successfully',
                enterprise: savedEnterprise,
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

    async updateEnterprise(
        id: string,
        updateData: Partial<enterpriseDTO>,
        file?: any
    ): Promise<{ success: boolean; message: string; enterprise?: enterpriseDTO }> {
        try {
            const enterprise = await this.enterprise.findById(id);
            console.log('Update Data:', updateData);
            if (!enterprise) {
                throw new NotFoundException(`Enterprise with ID ${id} not found`);
            }

            // Handle file upload
            const uploadLogoPath = file ? file : enterprise.uploadLogo;

            // Update the enterprise record
            const updatedEnterprise = await this.enterprise.findByIdAndUpdate(
                id,
                { ...updateData, uploadLogo: uploadLogoPath },
                { new: true }
            );

            if (!updatedEnterprise) {
                throw new HttpException(
                    { success: false, message: 'Failed to update enterprise' },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return {
                success: true,
                message: 'Enterprise updated successfully',
                enterprise: updatedEnterprise,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Update failed' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    // async getAllEnterprise(page = 1, limit = 10, search = '', status = ''): Promise<{ success: boolean; enterprise: any[]; total: number; activeCount: number; inactiveCount: number; deletedCount: number; page: number; limit: number; }> {
    //     try {
    //         const skip = (page - 1) * limit;

    //         const searchFilter: any = {};


    //         if (status === 'Deleted') {
    //             searchFilter.isDeleted = true;
    //         } else if (status === 'Active') {
    //             searchFilter.isDeleted = false;
    //             searchFilter.enterpriseStatus = 'Active';
    //         } else if (status === 'Inactive') {
    //             searchFilter.isDeleted = false;
    //             searchFilter.enterpriseStatus = 'Inactive';
    //         } else {
    //             searchFilter.isDeleted = { $in: [false, true] };
    //         }

    //         if (search) {
    //             searchFilter.enterpriseName = { $regex: search, $options: 'i' };
    //         }

    //         const [enterprise, total, activeCount, inactiveCount, deletedCount] = await Promise.all([
    //             this.enterprise.find(searchFilter).skip(skip).limit(limit),
    //             this.enterprise.countDocuments({ isDeleted: { $in: [false, true] } }),
    //             this.enterprise.countDocuments({ enterpriseStatus: 'Active', isDeleted: false }),
    //             this.enterprise.countDocuments({ enterpriseStatus: 'Inactive', isDeleted: false }),
    //             this.enterprise.countDocuments({ isDeleted: true })
    //         ]);

    //         return {
    //             success: true,
    //             enterprise,
    //             total,
    //             activeCount,
    //             inactiveCount,
    //             deletedCount,
    //             page,
    //             limit,
    //         };
    //     } catch (error) {
    //         throw new HttpException(
    //             { success: false, message: error.message || 'Failed to fetch enterprises' },
    //             HttpStatus.BAD_REQUEST
    //         );
    //     }
    // }
    async getAllEnterprise(
        page = 1,
        limit = 10,
        search = '',
        status = ''
    ): Promise<{
        success: boolean;
        enterprise: any[];
        total: number;
        activeCount: number;
        inactiveCount: number;
        deletedCount: number;
        page: number;
        limit: number;
    }> {
        try {
            const skip = (page - 1) * limit;
    
            const searchFilter: any = {};
    
            // Filter based on status
            if (status === 'Deleted') {
                searchFilter.isDeleted = true;
            } else {
                searchFilter.isDeleted = false;
                if (status === 'Active') {
                    searchFilter.enterpriseStatus = 'Active';
                } else if (status === 'Inactive') {
                    searchFilter.enterpriseStatus = 'Inactive';
                }
            }
    
            if (search) {
                searchFilter.enterpriseName = { $regex: search, $options: 'i' };
            }
    
            const [enterprise, total, activeCount, inactiveCount, deletedCount] = await Promise.all([
                this.enterprise.find(searchFilter).skip(skip).limit(limit),
                this.enterprise.countDocuments({ isDeleted: false }),
                this.enterprise.countDocuments({ enterpriseStatus: 'Active', isDeleted: false }),
                this.enterprise.countDocuments({ enterpriseStatus: 'Inactive', isDeleted: false }),
                this.enterprise.countDocuments({ isDeleted: true })
            ]);
    
            return {
                success: true,
                enterprise,
                total,
                activeCount,
                inactiveCount,
                deletedCount,
                page,
                limit,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprises' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    


    async getEnterpriseById(id: string): Promise<{ success: boolean; enterprise: any }> {
        try {
            const enterprise = await this.enterprise.findById(id);

            if (!enterprise) {
                throw new HttpException(
                    { success: false, message: 'Enterprise not found' },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                enterprise,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to fetch enterprise details' },
                HttpStatus.BAD_REQUEST
            );
        }
    }



    async deleteEnterprise(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const updatedEnterprise = await this.enterprise.findByIdAndUpdate(
                id,
                {
                    isDeleted: true, // Mark as deleted
                    enterpriseStatus: isEnterpriseStatus.DELETED // Update status to "Deleted"
                },
                { new: true }
            );

            if (!updatedEnterprise) {
                throw new HttpException(
                    { success: false, message: 'Enterprise not found' },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                success: true,
                message: 'Enterprise deleted successfully (soft delete)',
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Failed to delete enterprise' },
                HttpStatus.BAD_REQUEST
            );
        }
    }




    async updateEnterpriseStatus(data: any) {
        try {
            const user = await this.enterprise.findById(data?.userId);

            if (!user) {
                return {
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'User not found',
                };
            }

            const updatedUser = await this.enterprise.findByIdAndUpdate(
                data?.userId,
                {
                    $set: {
                        enterpriseStatus: data.status
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

    async getEnterpriseStats(): Promise<{
        success: boolean;
        message: string;
        totalEnterprises: number;
        activeEnterprises: number;
        inactiveEnterprises: number;
        newEnterprises: number;
    }> {
        try {
            // Get today's date and set the start of the day
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Fetch statistics in parallel for better performance
            const [totalEnterprises, activeEnterprises, inactiveEnterprises, newEnterprises] = await Promise.all([
                this.enterprise.countDocuments(), // Count total enterprises
                this.enterprise.countDocuments({ enterpriseStatus: 'Active' }), // Count active enterprises
                this.enterprise.countDocuments({ enterpriseStatus: 'Inactive' }), // Count inactive enterprises
                this.enterprise.countDocuments({ createdAt: { $gte: today } }) // Count new enterprises added today
            ]);

            return {
                success: true,
                message: 'Enterprise statistics fetched successfully.',
                totalEnterprises,
                activeEnterprises,
                inactiveEnterprises,
                newEnterprises
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to fetch enterprise statistics.',
                totalEnterprises: 0,
                activeEnterprises: 0,
                inactiveEnterprises: 0,
                newEnterprises: 0
            };
        }
    }
    async enterpriseList() {
        try {
            const enterprises = await this.enterprise
                .find({ enterpriseStatus: 'Active' }, { _id: 1, enterpriseName: 1 }) // Fetch only active enterprises
                .lean();

            if (!enterprises || enterprises.length === 0) {
                return {
                    success: true,
                    message: 'No active enterprises available',
                    data: [],
                };
            }

            const dropdownList = enterprises.map((ent) => ({
                id: ent._id,
                name: ent.enterpriseName,
            }));

            return {
                success: true,
                message: 'Active Enterprise List',
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
}
