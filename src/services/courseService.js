import api from './api';

export const getCourses = (params) => api.get('/courses', { params });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const enrollCourse = (id) => api.post(`/courses/${id}/enroll`);
export const getCourseProgress = (id) => api.get(`/courses/${id}/progress`);
