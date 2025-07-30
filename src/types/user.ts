export enum UserRoles {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserModel {
  id: number;
  email: string;
  name: string;
  password: string;
  role: UserRoles;
  avatarId: number;
  stars: number;
}

export interface GetUserResponse {
  data: UserModel;
}
