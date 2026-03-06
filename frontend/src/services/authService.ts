import axiosInstance from '@/lib/axios';
import { AuthUser } from '@/types';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Backend returns exactly: { token, user: { id, name, email, role, employeeId } }
export const authService = {
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: { name: string; email: string; password: string; role: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
    return data;
  },
};
