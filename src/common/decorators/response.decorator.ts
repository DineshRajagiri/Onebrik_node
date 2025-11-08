import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthEndPoint } from '../interface/EndpointResponseFile';


export function AuthResponse(endpoint: string) {
  /*---------------------------Auth ----------------------------------*/
  if (AuthEndPoint.REGISTER == endpoint) {
    return applyDecorators(
      ApiBody({
        type: 'object',
        schema: {
          example: {
            firstName: 'Ruben',
            lastName: 'Lazarus',
            displayName: 'Ruben Pranay Lazarus',
            mobileNo: '7222938282',
            email: 'mitraeoffice@gmail.com',
            departmentId: '83d50d37-64a1-4345-8074-833489b8cada',
            password: 'Test@123',
          },
        },
      }),
      ApiResponse({
        status: 201,
        schema: {
          example: {
            data: {
              updatedAt: '2023-08-04T05:28:36.588Z',
              isActive: true,
              email: 'rubenlazarus191@gmail.com',
              firstName: 'Ruben1',
              lastName: 'Lazarus1',
              displayName: 'Ruben Pranay Lazarus',
              mobileNo: '7222938281',
              role: 'USER',
              rememberMe: false,
              isVerifiedByAdmin: false,
              departmentId: '83d50d37-64a1-4345-8074-833489b8cada',
              _id: '55ffee73-dc81-4297-a2e2-8c086ec7aea3',
              __v: 0,
            },
            success: true,
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJ1YmVubGF6YXJ1czE5MUBnbWFpbC5jb20iLCJfaWQiOiI1NWZmZWU3My1kYzgxLTQyOTctYTJlMi04YzA4NmVjN2FlYTMiLCJtb2JpbGVObyI6IjcyMjI5MzgyODEiLCJSb2xlIjoiVVNFUiIsImlzVmVyaWZpZWRCeUFkbWluIjpmYWxzZSwiaWF0IjoxNjkxMTI2OTY2LCJleHAiOjE2OTE5OTA5NjZ9.qeMNVhMdYqQLfDuWV9w3Am5WbMKHDxPAUER2szhDzn4',
            message: 'User has been created',
          },
        },
      }),
      ApiResponse({
        status: 409,
        schema: {
          example: {
            message: 'something went wrong',
            success: false,
          },
        },
      }),
    );
  }
  if (AuthEndPoint.LOGIN == endpoint) {
    return applyDecorators(
      ApiBody({
        type: 'object',
        schema: {
          example: {
            "username":"7222938282",
            "password":"Test@123"
        }
        },
      }),
      ApiResponse({
        status: 201,
        schema: {
          example: {
            "data": {
                "_id": "f409d9dc-dcfb-4c50-bda0-06855f8631d2",
                "updatedAt": "2023-08-03T12:20:28.380Z",
                "isActive": true,
                "email": "mitraeoffice@gmail.com",
                "displayName": "Ruben Pranay Lazarus",
                "mobileNo": "7222938282",
                "role": "SUPERADMIN",
                "rememberMe": true,
                "isVerifiedByAdmin": true,
                "departmentId": "83d50d37-64a1-4345-8074-833489b8cada",
                "__v": 0,
                "firstName": "Ruben",
                "lastName": "Lazarus"
            },
            "success": true,
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJ1YmVubGF6YXJ1czE5QGdtYWlsLmNvbSIsIl9pZCI6ImY0MDlkOWRjLWRjZmItNGM1MC1iZGEwLTA2ODU1Zjg2MzFkMiIsIm1vYmlsZU5vIjoiNzIyMjkzODI4MiIsIlJvbGUiOiJTVVBFUkFETUlOIiwiaXNWZXJpZmllZEJ5QWRtaW4iOnRydWUsImlhdCI6MTY5MTEyNzQ3OCwiZXhwIjoxNjkxOTkxNDc4fQ.AyUhPC9_oNi4B9JLlLURqWTyheCSs33lXTS-TzOY4MA",
            "isUserExists": true,
            "message": "User Exists"
        }
        },
      }),
      ApiResponse({
        status: 400,
        schema: {
          example: {
            "success": false,
            "message": "data and hash arguments required"
        }
        },
      }),
    );
  }
  if (AuthEndPoint.GET_USER_DATA_BY_TOKEN == endpoint) {
    return applyDecorators(
    
      ApiResponse({
        status: 201,
        schema: {
          example: {
            "data": {
                "_id": "f409d9dc-dcfb-4c50-bda0-06855f8631d2",
                "updatedAt": "2023-08-03T12:20:28.380Z",
                "isActive": true,
                "email": "mitraeoffice@gmail.com",
                "displayName": "Ruben Pranay Lazarus",
                "mobileNo": "7222938282",
                "role": "SUPERADMIN",
                "rememberMe": true,
                "isVerifiedByAdmin": true,
                "departmentId": "83d50d37-64a1-4345-8074-833489b8cada",
                "__v": 0,
                "firstName": "Ruben",
                "lastName": "Lazarus"
            },
            "success": true,
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJ1YmVubGF6YXJ1czE5QGdtYWlsLmNvbSIsIl9pZCI6ImY0MDlkOWRjLWRjZmItNGM1MC1iZGEwLTA2ODU1Zjg2MzFkMiIsIm1vYmlsZU5vIjoiNzIyMjkzODI4MiIsIlJvbGUiOiJTVVBFUkFETUlOIiwiaXNWZXJpZmllZEJ5QWRtaW4iOnRydWUsImlhdCI6MTY5MTEyNzQ3OCwiZXhwIjoxNjkxOTkxNDc4fQ.AyUhPC9_oNi4B9JLlLURqWTyheCSs33lXTS-TzOY4MA",
            "isUserExists": true,
            "message": "User Exists"
        }
        },
      }),
      ApiResponse({
        status: 401,
        schema: {
          example:{
            "message": "Unauthorized",
            "statusCode": 401
          }
        },
      }),
    );
  }
}
