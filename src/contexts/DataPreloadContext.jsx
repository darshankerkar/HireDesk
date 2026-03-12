import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import axios from 'axios';
import config from '../../config';

const DataPreloadContext = createContext(null);

export function usePreloadedData() {
  return useContext(DataPreloadContext);
}

export function DataPreloadProvider({ children }) {
  const [jobs, setJobs] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [userCandidates, setUserCandidates] = useState(null);
  const [userInterviews, setUserInterviews] = useState(null);
  const [recruiterStats, setRecruiterStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  // Preload all data that pages need
  const preloadAll = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    const email = userData?.email;
    if (!email) {
      setLoading(false);
      setReady(true);
      return;
    }

    setLoading(true);
    const isRecruiter = userData?.role === 'RECRUITER' && userData?.is_paid;

    try {
      // Fire all independent requests in parallel
      const promises = [
        // Jobs (used by Home, CandidateJobs, UploadResume, CandidateDashboard)
        axios.get(`${config.apiUrl}/api/recruitment/jobs/`).then(r => r.data).catch(() => []),
        // Platform stats (used by Home — lightweight, replaces the 8s candidates fetch)
        axios.get(`${config.apiUrl}/api/recruitment/platform-stats/`).then(r => r.data).catch(() => null),
        // User's candidate records (used by CandidateDashboard, CandidateJobs)
        api.get(`/recruitment/candidates/?email=${encodeURIComponent(email)}`).then(r => r.data).catch(() => []),
        // User's interviews (used by CandidateDashboard)
        api.get('/recruitment/my-interviews/').then(r => r.data).catch(() => []),
      ];

      // Recruiter stats if applicable
      if (isRecruiter) {
        promises.push(
          api.get(`/recruitment/jobs/recruiter-stats/?email=${encodeURIComponent(email)}`).then(r => r.data).catch(() => null)
        );
      }

      const results = await Promise.all(promises);

      setJobs(Array.isArray(results[0]) ? results[0] : []);
      setPlatformStats(results[1]);
      setUserCandidates(Array.isArray(results[2]) ? results[2] : []);
      setUserInterviews(Array.isArray(results[3]) ? results[3] : []);
      if (isRecruiter && results[4]) {
        setRecruiterStats(results[4]);
      }
    } catch (err) {
      console.error('Preload error:', err);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  // Trigger preload when provider mounts (after login)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      preloadAll();
    } else {
      setLoading(false);
      setReady(true);
    }
  }, [preloadAll]);

  // Allow pages to force a refresh of specific data
  const refreshJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/recruitment/jobs/`);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  }, []);

  const refreshUserCandidates = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    const email = userData?.email;
    if (!email) return;
    try {
      const res = await api.get(`/recruitment/candidates/?email=${encodeURIComponent(email)}`);
      setUserCandidates(Array.isArray(res.data) ? res.data : []);
    } catch { /* ignore */ }
  }, []);

  return (
    <DataPreloadContext.Provider value={{
      jobs,
      platformStats,
      userCandidates,
      userInterviews,
      recruiterStats,
      loading,
      ready,
      refreshJobs,
      refreshUserCandidates,
      preloadAll,
    }}>
      {children}
    </DataPreloadContext.Provider>
  );
}
