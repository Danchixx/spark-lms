import api from './api';
import type { AxiosResponse } from 'axios';

export const getProfile = (): Promise<AxiosResponse> =>
  api.get('/user/profile');

export const updateProfile = (data: Record<string, unknown>): Promise<AxiosResponse> =>
  api.put('/user/profile', data);

export const getEnrolledCourses = (): Promise<AxiosResponse> =>
  api.get('/user/courses');
