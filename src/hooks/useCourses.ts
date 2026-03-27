import { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';

const useCourses = (params: Record<string, unknown> = {}) => {
  const [courses, setCourses] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCourses(params)
      .then((res) => setCourses(res.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { courses, loading, error };
};

export default useCourses;
