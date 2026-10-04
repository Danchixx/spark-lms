export const APP_NAME = 'Spark LMS';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

export const COURSE_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};
