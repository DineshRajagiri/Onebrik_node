import { SaveUserDto } from "./DTO/create-user.dto";



export interface IUsersService {

  save(dto: SaveUserDto): Promise<any>;


}

