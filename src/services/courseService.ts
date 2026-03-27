import api from './api';
import type { AxiosResponse } from 'axios';

export const getCourses = (params?: Record<string, unknown>): Promise<AxiosResponse> =>
  api.get('/courses', { params });

export const getCourseById = (id: number | string): Promise<AxiosResponse> =>
  api.get(`/courses/${id}`);

export const enrollCourse = (id: number | string): Promise<AxiosResponse> =>
  api.post(`/courses/${id}/enroll`);

export const getCourseProgress = (id: number | string): Promise<AxiosResponse> =>
  api.get(`/courses/${id}/progress`);
