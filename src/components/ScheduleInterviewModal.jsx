import React, { useState } from 'react';
import api from '../utils/api';
import './ScheduleInterviewModal.css';

const ScheduleInterviewModal = ({ isOpen, candidate, job, onClose, onScheduled }) => {
  if (!isOpen || !candidate) return null;

  const jobInfo = job || candidate.job || {};
  const jobTitle = jobInfo.title || 'Position';
  const jobId = jobInfo.id || candidate.job_id;

  const [formData, setFormData] = useState({
    title: `${jobTitle} - Interview`,
    interview_type: 'SCREENING',
    scheduled_date: '',
    scheduled_hour: '10:00',
    duration_minutes: 60,
    timezone: 'Asia/Kolkata',
    recruiter_notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interviewTypes = [
    { value: 'SCREENING', label: 'Screening Round' },
    { value: 'TECHNICAL', label: 'Technical Round' },
    { value: 'HR', label: 'HR Round' },
    { value: 'FINAL', label: 'Final Round' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!candidate.id) { setError('Candidate information is missing.'); setLoading(false); return; }
      if (!jobId) { setError('Job information is missing.'); setLoading(false); return; }
      if (!formData.scheduled_date) { setError('Please select a date.'); setLoading(false); return; }
      
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_hour}:00`).toISOString();
      
      const payload = {
        title: formData.title,
        interview_type: formData.interview_type,
        scheduled_time: scheduledDateTime,
        duration_minutes: parseInt(formData.duration_minutes),
        recruiter_notes: formData.recruiter_notes || '',
        candidate: candidate.id,
        job: jobId
      };

      console.log('Scheduling interview with payload:', JSON.stringify(payload, null, 2));

      const response = await api.post('/recruitment/interviews/', payload);
      console.log('Interview scheduled successfully:', response.data);
      
      alert('Interview scheduled successfully!');
      if (onScheduled) onScheduled(response.data);
      onClose();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to schedule interviews.');
      } else if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object' && !data.detail && !data.error) {
          const messages = [];
          for (const [field, errors] of Object.entries(data)) {
            if (Array.isArray(errors)) messages.push(`${field}: ${errors.join(', ')}`);
            else if (typeof errors === 'string') messages.push(`${field}: ${errors}`);
          }
          setError(messages.length > 0 ? messages.join('\n') : JSON.stringify(data));
        } else {
          setError(typeof data === 'string' ? data : data.detail || data.error || JSON.stringify(data));
        }
      } else {
        setError('Failed to schedule interview. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sim-overlay" onClick={onClose}>
      <div className="sim-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sim-header">
          <div className="sim-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4F223" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <h2>Schedule Interview</h2>
          </div>
          <button className="sim-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Candidate Info */}
        <div className="sim-candidate">
          <div className="sim-candidate-row">
            <span className="sim-candidate-label">Candidate:</span>
            <span className="sim-candidate-value">{candidate.name}</span>
          </div>
          <div className="sim-candidate-row">
            <span className="sim-candidate-label">Email:</span>
            <span className="sim-candidate-value">{candidate.email}</span>
          </div>
          <div className="sim-candidate-row">
            <span className="sim-candidate-label">Position:</span>
            <span className="sim-candidate-value">{jobTitle}</span>
          </div>
          {candidate.score && (
            <div className="sim-candidate-row">
              <span className="sim-candidate-label">Score:</span>
              <span className="sim-score">{candidate.score.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="sim-error" style={{ whiteSpace: 'pre-wrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="sim-form">
          <div className="sim-field">
            <label htmlFor="title">Interview Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Technical Round - Python Developer" />
          </div>

          <div className="sim-row">
            <div className="sim-field">
              <label htmlFor="interview_type">Interview Type *</label>
              <select id="interview_type" name="interview_type" value={formData.interview_type} onChange={handleChange} required>
                {interviewTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="sim-field">
              <label htmlFor="duration_minutes">Duration (minutes) *</label>
              <select id="duration_minutes" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
          </div>

          <div className="sim-row">
            <div className="sim-field">
              <label htmlFor="scheduled_date">Date *</label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 10)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
              />
              <small className="sim-hint">Click anywhere on the field to pick a date</small>
            </div>
            <div className="sim-field">
              <label htmlFor="scheduled_hour">Time *</label>
              <select id="scheduled_hour" name="scheduled_hour" value={formData.scheduled_hour} onChange={handleChange} required>
                <option value="08:00">08:00 AM</option>
                <option value="08:30">08:30 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">01:00 PM</option>
                <option value="13:30">01:30 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
                <option value="17:00">05:00 PM</option>
                <option value="17:30">05:30 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="18:30">06:30 PM</option>
                <option value="19:00">07:00 PM</option>
                <option value="20:00">08:00 PM</option>
              </select>
            </div>
          </div>

          <div className="sim-field">
            <label htmlFor="timezone">Timezone</label>
            <select id="timezone" name="timezone" value={formData.timezone} onChange={handleChange}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div className="sim-field">
            <label htmlFor="recruiter_notes">Notes (Optional)</label>
            <textarea id="recruiter_notes" name="recruiter_notes" value={formData.recruiter_notes} onChange={handleChange} rows="3" placeholder="Add any notes or special instructions..." />
          </div>

          <div className="sim-actions">
            <button type="button" className="sim-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="sim-btn-submit" disabled={loading}>
              {loading ? (
                <><span className="sim-btn-spinner" /> Scheduling...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>

        <div className="sim-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
          The candidate will receive an automatic email with interview details and link.
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
