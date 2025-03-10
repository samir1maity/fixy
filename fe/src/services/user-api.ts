import apiService from './api';

// Define types for your API responses
export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Base path for user-related endpoints
const BASE_PATH = '/users';

// Function-based User API service
export const userApiService = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return apiService.get<User>(`${BASE_PATH}/me`);
  },

  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiService.post<LoginResponse>(`${BASE_PATH}/login`, credentials);
  },

  // Register
  register: async (userData: Omit<User, 'id'> & { password: string }): Promise<User> => {
    return apiService.post<User>(`${BASE_PATH}/signup`, userData);
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    return apiService.put<User>(`${BASE_PATH}/${userId}`, userData);
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    return apiService.delete<void>(`${BASE_PATH}/${userId}`);
  }
};

export default userApiService; 