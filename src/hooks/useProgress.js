import { useState, useEffect } from 'react';
import { getCourseProgress } from '../services/courseService';

const useProgress = (courseId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    getCourseProgress(courseId)
      .then((res) => setProgress(res.data))
      .finally(() => setLoading(false));
  }, [courseId]);

  return { progress, loading };
};

export default useProgress;
