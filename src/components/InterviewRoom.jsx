import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import PeerVideoCall from './PeerVideoCall';
import './InterviewRoom.css';


const InterviewRoom = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      
      if (!token) {
        setError('You are not logged in. Please login and try again.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching interview:', interviewId);
      
      const response = await axios.get(
        `${apiUrl}/api/recruitment/interviews/${interviewId}/`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log('Interview details loaded:', response.data);
      setInterview(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching interview:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Stale token or wrong permissions.
        // Clear tokens and reload to force InterviewJoinGate to appear.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        window.location.reload();
        return;
      }
      
      setError('Failed to load interview details');
      setLoading(false);
    }
  };

  const markInterviewAsStarted = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      
      await axios.post(
        `${apiUrl}/api/recruitment/interviews/${interviewId}/start/`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      console.log('Interview marked as started');
    } catch (err) {
      console.warn('Could not mark interview as started:', err);
    }
  };

  // Mark as started when component mounts
  useEffect(() => {
    if (interview) {
      markInterviewAsStarted();
    }
  }, [interview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading interview room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-surface border border-gray-800 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-6 py-3 bg-primary text-dark font-bold rounded-full hover:bg-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const firebaseUser = JSON.parse(localStorage.getItem('firebaseUser') || '{}');
  const currentEmail = (userData.email || firebaseUser.email || '').toLowerCase();
  const recruiterEmail = (interview.recruiter?.email || '').toLowerCase();
  const isCurrentUserAdmin = !!(currentEmail && recruiterEmail && currentEmail === recruiterEmail);

  const displayName = isCurrentUserAdmin
    ? 'Admin'
    : (firebaseUser.displayName || userData.email?.split('@')[0] || interview.candidate?.name || 'Participant');

  return (
    <PeerVideoCall 
      roomId={interviewId}
      userName={displayName}
      isAdmin={isCurrentUserAdmin}
    />
  );
};

export default InterviewRoom;
