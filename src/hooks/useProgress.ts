import { useState, useEffect } from 'react';
import { getCourseProgress } from '../services/courseService';

const useProgress = (courseId: number | string | null) => {
  const [progress, setProgress] = useState<unknown>(null);
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
