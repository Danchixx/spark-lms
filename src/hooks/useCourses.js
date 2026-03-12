import { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';

const useCourses = (params = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCourses(params)
      .then((res) => setCourses(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { courses, loading, error };
};

export default useCourses;
