import { CreateProfileDTO } from "./DTO/create-profile.dto";

export interface IUserProfileService {
    setProfile(collectionName: CreateProfileDTO): Promise<string>;
    getProfile(collectionName: any): Promise<string>;
}