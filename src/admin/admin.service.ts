import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { admin, adminDetails } from 'src/schema/admin.schema';
import { AdminDTO } from './dto/admin.dto';
import * as bcrypt from 'bcrypt';
import { isAdminStatus } from 'src/utils/constants';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(admin.name) private readonly admin: Model<adminDetails>,) {
    }
    async createAdmin(data: AdminDTO, file?: any) {
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

            const existingAdmin = await this.admin.findOne({ email: data.email });

            if (existingAdmin) {
                return {
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    message: 'Admin already exists',
                };
            }


            if (!data.password) {
                throw new HttpException(
                    {
                        success: false,
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'Password is required',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);


            data.passwordHash = hashedPassword;
            delete data.password;

            data.adminProfile = file;
            // data.adminStatus = isAdminStatus.ACTIVE;

            const savedAdmin = await this.admin.create(data);

            if (!savedAdmin) {
                throw new HttpException(
                    { success: false, message: 'Unable to create admin' },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            return {
                success: true,
                statusCode: HttpStatus.CREATED,
                message: 'Admin created successfully',
                admin: savedAdmin,
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



    async getAllAdmin(page = 1, limit = 10, search = '', status = ''): Promise<{
        success: boolean;
        admin: any[];
        total: number;
        activeCount: number;
        inactiveCount: number;
        page: number;
        limit: number;
      }> {
        try {
          const skip = (page - 1) * limit;
          const searchFilter: any = { role: 'ADMIN' }; // Ensure only ADMINs are fetched
      
          // Add search filter for email
          if (search) {
            searchFilter.email = { $regex: search, $options: 'i' };
          }
      
          // Filter by admin status if provided
          if (status) {
            searchFilter.adminStatus = status;
          }
      
          const [admin, total, activeCount, inactiveCount] = await Promise.all([
            this.admin.find(searchFilter).skip(skip).limit(limit),
            this.admin.countDocuments(searchFilter), // Count only ADMINs
            this.admin.countDocuments({ ...searchFilter, adminStatus: 'Active' }),
            this.admin.countDocuments({ ...searchFilter, adminStatus: 'Inactive' }),
          ]);
      
          return {
            success: true,
            admin,
            total,
            activeCount,
            inactiveCount,
            page,
            limit,
          };
        } catch (error) {
          throw new HttpException(
            { success: false, message: error.message || 'Failed to fetch admins' },
            HttpStatus.BAD_REQUEST
          );
        }
      }
      

    async updateAdmin(id: string, updateData: Partial<AdminDTO>, file?: any): Promise<{ success: boolean; message: string; admin?: Partial<AdminDTO> }> {
        try {
            const admin = await this.admin.findById(id);
            console.log('Update Data:', updateData);
            if (!admin) {
                throw new NotFoundException(`Admin with ID ${id} not found`);
            }
            const uploadLogoPath = file ? file : admin.adminProfile;
            const updatedAdmin = await this.admin.findByIdAndUpdate(
                id,
                { ...updateData, adminProfile: uploadLogoPath },
                { new: true }
            );
            if (!updatedAdmin) {
                throw new HttpException(
                    { success: false, message: 'Failed to update admin' },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
            // Convert Mongoose document to DTO manually
            const adminDTO: Partial<AdminDTO> = {
                email: updatedAdmin.email,
                fullName: updatedAdmin.fullName,
                mobileNo: updatedAdmin.mobileNo,
                role: updatedAdmin.role,
                adminProfile: updatedAdmin.adminProfile,
                // adminStatus: updatedAdmin.adminStatus,
            };

            return {
                success: true,
                message: 'Admin updated successfully',
                admin: adminDTO,
            };
        } catch (error) {
            throw new HttpException(
                { success: false, message: error.message || 'Update failed' },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async deleteAdmin(id: string) {
        try {
            const deleteAdmin = await this.admin.findByIdAndDelete(id);

            if (!deleteAdmin) {
                return {
                    success: false,
                    message: 'admin not found',
                };
            }

            return {
                success: true,
                message: 'admin deleted successfully',
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error?.message || 'An error occurred while deleting the admin',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async updateAdminStatus(data: any) {
        try {
            const admin = await this.admin.findById(data?._id);
            if (!admin) {
                return {
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Admin not found',
                };
            }
            const updatedAdmin = await this.admin.findByIdAndUpdate(
                data?._id,
                {
                    $set: {
                        adminStatus: data.status
                    },
                },
                { new: true }
            );
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Admins status added successfully',
                admin: updatedAdmin,
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
    async getAdminById(adminId: string) {
        try {
            const admin = await this.admin.findById(adminId);
            if (!admin) {
                return {
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Admin not found',
                };
            }
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Admin details retrieved successfully',
                admin
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
    // async updateAdminProfile(adminId: string, fileUrl: string) {
    //     try {
    //         const admin = await this.admin.findById(adminId);
    //         if (!admin) {
    //             throw new HttpException(
    //                 { success: false, statusCode: HttpStatus.NOT_FOUND, message: 'Admin not found' },
    //                 HttpStatus.NOT_FOUND
    //             );
    //         }

    //         admin.adminProfile = fileUrl;

    //         const updatedAdmin = await admin.save();

    //         return {
    //             success: true,
    //             statusCode: HttpStatus.OK,
    //             message: 'Admin profile updated successfully',
    //             admin: {
    //                 ...updatedAdmin.toObject(),
    //                 adminProfile: fileUrl,
    //             },
    //         };
    //     } catch (error) {
    //         throw new HttpException(
    //             { success: false, statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message || 'An error occurred' },
    //             HttpStatus.INTERNAL_SERVER_ERROR
    //         );
    //     }
    // }
    async updateAdminProfile(id: string, adminProfile: string) {
        const updatedAdmin = await this.admin.findOneAndUpdate(
          { _id: id },
          { adminProfile },
          { new: true },
        ).select('adminProfile');
      
        if (!updatedAdmin) {
          throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
        }
      
        return {
          success: true,
          message: 'Admin profile updated successfully',
          admin: updatedAdmin,
        };
      }
      
    
    
    async changePassword(
        adminId: string,
        oldPassword: string,
        newPassword: string,
        confirmPassword: string
    ): Promise<{ success: boolean; statusCode: number; message: string; newPasswordHash?: string }> {
        try {
            
            const admin = await this.admin.findById(adminId);
            if (!admin) {
                throw new HttpException(
                    { success: false, statusCode: HttpStatus.NOT_FOUND, message: 'Admin not found' },
                    HttpStatus.NOT_FOUND
                );
            }
    
         
            const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.passwordHash);
            if (!isOldPasswordValid) {
                throw new HttpException(
                    { success: false, statusCode: HttpStatus.UNAUTHORIZED, message: 'Old password is incorrect' },
                    HttpStatus.UNAUTHORIZED
                );
            }
    
            if (newPassword !== confirmPassword) {
                throw new HttpException(
                    { success: false, statusCode: HttpStatus.BAD_REQUEST, message: 'New password and confirm password do not match' },
                    HttpStatus.BAD_REQUEST
                );
            }
    
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            admin.passwordHash = hashedPassword;
            await admin.save();
    
            return {
                success: true,
                statusCode: HttpStatus.OK,
                message: 'Password updated successfully',
              
            };
        } catch (error) {
            throw new HttpException(
                { success: false, statusCode: HttpStatus.BAD_REQUEST, message: error.message || 'Error occurred while changing password' },
                HttpStatus.BAD_REQUEST
            );
        }
    }
    
    async getAdminProfileById(_id: string) {
        const admin = await this.admin.findById(_id).select('adminProfile');
      
        if (!admin) {
          throw new HttpException(
            {
              success: false,
              statusCode: HttpStatus.NOT_FOUND,
              message: 'Admin not found',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: 'Admin profile retrieved successfully',
          adminProfile: admin.adminProfile || null,
        };
      }
 

}