export interface RegisterRequest {
  username: string;
  password: string;
  confirmedPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  data?: {
    uuid?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}
