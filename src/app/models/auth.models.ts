export interface LoginDTO {
  email: string;
  password?: string; 
}

export interface Verify2FaDTO {
  email: string;
  code: string;
}

export interface TokenResponseDTO {
  token: string;
}

export interface UserCreateDTO {
  name: string;
  email: string;
  password?: string;
}