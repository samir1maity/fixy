import apiService from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  orgName?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  orgName?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

const BASE_PATH = '/users';

export const userApiService = {
  getCurrentUser: async (): Promise<User> => {
    return apiService.get<User>(`${BASE_PATH}/me`);
  },

  getProfile: async (): Promise<User> => {
    const res = await apiService.get<{ user: User }>(`${BASE_PATH}/profile`);
    return res.user;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const res = await apiService.put<{ user: User; message: string }>(`${BASE_PATH}/profile`, data);
    return res.user;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiService.post<LoginResponse>(`${BASE_PATH}/login`, credentials);
  },

  register: async (userData: Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<LoginResponse> => {
    return apiService.post<LoginResponse>(`${BASE_PATH}/signup`, userData);
  },

  deleteUser: async (userId: string): Promise<void> => {
    return apiService.delete<void>(`${BASE_PATH}/${userId}`);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>(`${BASE_PATH}/forgot-password`, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return apiService.post<{ message: string }>(`${BASE_PATH}/reset-password`, data);
  },
};

export default userApiService;
