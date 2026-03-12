import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import './InterviewsDashboard.css';

const InterviewsDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchInterviews(); }, []);
  useEffect(() => { filterInterviews(); }, [filter, interviews]);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      if (!token) { setError('You are not logged in. Please login and try again.'); setLoading(false); return; }
      
      const response = await axios.get(`${apiUrl}/api/recruitment/interviews/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setInterviews(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews');
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviews];
    switch (filter) {
      case 'upcoming': filtered = interviews.filter(i => i.is_upcoming); break;
      case 'past': filtered = interviews.filter(i => i.is_past); break;
      case 'today':
        const today = new Date();
        filtered = interviews.filter(i => new Date(i.scheduled_time).toDateString() === today.toDateString());
        break;
      default: filtered = interviews;
    }
    filtered.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
    setFilteredInterviews(filtered);
  };

  const handleJoinInterview = (interviewId) => navigate(`/interview/room/${interviewId}`);

  const handleViewAnalysis = async (interview) => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      const response = await axios.get(`${apiUrl}/api/recruitment/interviews/${interview.id}/get_analysis/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedInterview({ ...interview, analysis: response.data });
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      alert('Analysis not available yet');
    }
  };

  const handleCompleteInterview = async (interviewId) => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      await axios.post(`${apiUrl}/api/recruitment/interviews/${interviewId}/complete/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInterviews();
      alert('Interview marked as completed.');
    } catch (err) {
      console.error('Error completing interview:', err);
      alert('Failed to complete interview');
    }
  };

  const handleCopyInterviewLink = (interviewId) => {
    const interviewLink = `${window.location.origin}/interview/room/${interviewId}`;
    navigator.clipboard.writeText(interviewLink).then(() => {
      setCopiedId(interviewId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      window.prompt('Copy this link:', interviewLink);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'scheduled';
      case 'ONGOING': return 'ongoing';
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="id-page id-loading">
        <div className="id-spinner" />
        <p>Loading interviews...</p>
      </div>
    );
  }

  return (
    <div className="id-page">
      {/* Header */}
      <div className="id-header">
        <h1>Interview <span className="id-highlight">Management</span></h1>
        <p>Manage, conduct, and analyze candidate interviews</p>
      </div>

      {/* Filter Tabs */}
      <div className="id-filters">
        {[
          { key: 'all', label: `All Interviews (${interviews.length})` },
          { key: 'today', label: 'Today' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
        ].map(f => (
          <button
            key={f.key}
            className={`id-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interview Cards */}
      {filteredInterviews.length === 0 ? (
        <div className="id-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h3>No Interviews Found</h3>
          <p>Schedule interviews from the candidate dashboard</p>
        </div>
      ) : (
        <div className="id-grid">
          {filteredInterviews.map(interview => (
            <div key={interview.id} className="id-card">
              <div className="id-card-top">
                <h3>{interview.title}</h3>
                <span className={`id-status ${getStatusColor(interview.status)}`}>{interview.status}</span>
              </div>

              <div className="id-card-body">
                <div className="id-info-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="id-label">Candidate</span>
                  <span className="id-value">{interview.candidate_name}</span>
                </div>
                <div className="id-info-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <span className="id-label">Position</span>
                  <span className="id-value">{interview.job_title}</span>
                </div>
                <div className="id-info-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span className="id-label">Email</span>
                  <span className="id-value">{interview.candidate_email}</span>
                </div>
                <div className="id-info-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span className="id-label">Scheduled</span>
                  <span className="id-value">{new Date(interview.scheduled_time).toLocaleString()}</span>
                </div>
                <div className="id-info-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="id-label">Duration</span>
                  <span className="id-value">{interview.duration_minutes} minutes</span>
                </div>
                <div className="id-info-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span className="id-label">Type</span>
                  <span className="id-value">{interview.interview_type}</span>
                </div>
                {interview.overall_rating && (
                  <div className="id-info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span className="id-label">Rating</span>
                    <span className="id-value">{interview.overall_rating}/5</span>
                  </div>
                )}
              </div>

              <div className="id-card-actions">
                {(interview.status === 'SCHEDULED' && interview.is_upcoming) && (
                  <>
                    <button className="id-btn id-btn-primary" onClick={() => handleJoinInterview(interview.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      Join
                    </button>
                    <button className="id-btn id-btn-secondary" onClick={() => handleCopyInterviewLink(interview.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      {copiedId === interview.id ? 'Copied!' : 'Copy Link'}
                    </button>
                  </>
                )}
                {interview.status === 'ONGOING' && (
                  <>
                    <button className="id-btn id-btn-primary" onClick={() => handleJoinInterview(interview.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      Rejoin
                    </button>
                    <button className="id-btn id-btn-secondary" onClick={() => handleCopyInterviewLink(interview.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      {copiedId === interview.id ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button className="id-btn id-btn-outline" onClick={() => handleCompleteInterview(interview.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Complete
                    </button>
                  </>
                )}
                {interview.status === 'COMPLETED' && (
                  <button className="id-btn id-btn-secondary" onClick={() => handleViewAnalysis(interview)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    View Analysis
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysis && selectedInterview && (
        <div className="id-modal-overlay" onClick={() => setShowAnalysis(false)}>
          <div className="id-modal" onClick={(e) => e.stopPropagation()}>
            <div className="id-modal-header">
              <h2>Interview Analysis</h2>
              <button className="id-close-btn" onClick={() => setShowAnalysis(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="id-modal-body">
              <h3>{selectedInterview.title}</h3>
              <p className="id-subtitle">{selectedInterview.candidate_name}</p>
              
              {selectedInterview.analysis?.analysis_data && (
                <div className="id-analysis-sections">
                  {selectedInterview.analysis.analysis_data.summary && (
                    <div className="id-analysis-section">
                      <h4>Summary</h4>
                      <p>{selectedInterview.analysis.analysis_data.summary}</p>
                    </div>
                  )}
                  {selectedInterview.analysis.analysis_data.key_skills_mentioned && (
                    <div className="id-analysis-section">
                      <h4>Key Skills Mentioned</h4>
                      <div className="id-tags">
                        {selectedInterview.analysis.analysis_data.key_skills_mentioned.map((skill, idx) => (
                          <span key={idx} className="id-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedInterview.analysis.analysis_data.recommendation && (
                    <div className="id-analysis-section">
                      <h4>Recommendation</h4>
                      <p className={`id-recommendation ${selectedInterview.analysis.analysis_data.recommendation}`}>
                        {selectedInterview.analysis.analysis_data.recommendation.replace('_', ' ').toUpperCase()}
                      </p>
                      {selectedInterview.analysis.analysis_data.recommendation_reasoning && (
                        <p>{selectedInterview.analysis.analysis_data.recommendation_reasoning}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {selectedInterview.analysis?.transcript_text && (
                <div className="id-analysis-section" style={{ marginTop: '1.5rem' }}>
                  <h4>Transcript</h4>
                  <div className="id-transcript-box">{selectedInterview.analysis.transcript_text}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewsDashboard;
