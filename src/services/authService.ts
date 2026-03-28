import api from './api';
import type { AxiosResponse } from 'axios';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const login = (credentials: LoginCredentials): Promise<AxiosResponse> =>
  api.post('/auth/login', credentials);

export const register = (data: RegisterData): Promise<AxiosResponse> =>
  api.post('/auth/register', data);

export const logout = (): Promise<AxiosResponse> =>
  api.post('/auth/logout');

export const getMe = (): Promise<AxiosResponse> =>
  api.get('/auth/me');
