

export enum Services {
    AUTH = 'AUTH_SERVICE',
    TABLE = "TABLE",
    RBAC = 'RBAC_SERVICE',
    SIDEBAR = 'SIDEBAR_SERVICE',
    ROLE = 'ROLE_SERVICE',
    PERMISSION = 'PERMISSION_SERVICE',
    FILE = 'FILE_SERVICE',
    USERPROFILE = 'USERPROFILE_SERVICE',
    USERS = 'USERS_SERVICE',
    NOTIFICATION = 'NOTIFICATION',
    MASTERS='MASTERS_SERVICE',
    ENTERPRISE='ENTERPRISE_SERVICE',
    VENDOR='VENDOR_SEVICE',
    DEALS = "DEALS",
    ADMIN = "ADMIN",
    NEFT = "NEFT",
    BLOGS="BLOGS",
    WITHDRAWAL="WITHDRAWAL",
    DELIVERYBOY="DELIVERYBOY"
}

export enum Roles{
    SUPERADMIN='SUPERADMIN',
    ADMIN='ADMIN',
    USER='USER'
  }
   
  export enum neftStatus{
    APPROVED='APPROVED',
    REJECTED='REJECTED',
    PENDING='PENDING'
  }

  export enum withdrawalStatus{
    APPROVED='APPROVED',
    REJECTED='REJECTED',
    PENDING='PENDING',
    CANCELLED='CANCELLED'
  }
  export enum isUserStatus{
    APPROVED="Approved",
    REJECTED="Rejected",
    PENDING="Pending",
    ACTIVE = "ACTIVE"
  }
  export enum isEnterpriseStatus{
    ACTIVE="Active",
    INACTIVE="Inactive",
    DELETED="Deleted" 
  }
  export enum isAdminStatus{
    ACTIVE="Active",
    INACTIVE="Inactive", 
  }

  export enum isDealStatus{
    CURRENT="Active",
    INACTIVE="Inactive",
    UPCOMING="Future",  
    PAST="Closed",
    FUTURE = "FUTURE"
  }

  export enum isVendorStatus{
    ACTIVE="Active",
    INACTIVE="Inactive",  
    DELETED="Deleted"
  }
  export enum dealTypes{
    SHORTTERM="ShortTerm",
    STRATEGIC="Strategic",  
  }
  export enum userResponseMessage{
    NOT_FOUND="User not found",
    FOUND="User found successfully",
    CREATE="User created successfully",
    CREATE_ERROR ="Unable to create user",
    UPDATE="User updated successfully",
    UPDATE_ERROR="Unable to update user",
    UNAUTHORIZED ="Unauthorized user",
    NOT_FOUND_LIST="User list not found",
    FOUND_LIST="User list found successfully",
    EXIST="User already exists",
  }

  export enum PaymentStatus {
    FAILED = 'FAILED',
    SUCCESS = 'SUCCESS',
  }