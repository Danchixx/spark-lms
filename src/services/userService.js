import api from './api';

export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => api.put('/user/profile', data);
export const getEnrolledCourses = () => api.get('/user/courses');
