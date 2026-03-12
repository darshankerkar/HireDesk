import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import './InterviewProctor.css';

const InterviewProctor = ({ videoRef, isActive, onViolation, userName }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState([]);
  const [currentWarning, setCurrentWarning] = useState(null);
  const [trustScore, setTrustScore] = useState(100);
  const [faceStatus, setFaceStatus] = useState('detecting');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [multipleFaceCount, setMultipleFaceCount] = useState(0);
  const [lookAwayCount, setLookAwayCount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [proctorMinimized, setProctorMinimized] = useState(false);

  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const violationsRef = useRef([]);
  const noFaceFramesRef = useRef(0);
  const lastFacePositionRef = useRef(null);
  const tabSwitchStartRef = useRef(null);
  const detectingRef = useRef(false); // prevent overlapping detections

  // ── Load face-api.js Models ──
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        console.log('Proctor: Face detection models loaded');
        setModelsLoaded(true);
      } catch (err) {
        console.error('Proctor: Failed to load models:', err);
      }
    };
    loadModels();
  }, []);

  // ── Start/Stop Monitoring ──
  useEffect(() => {
    if (isActive && modelsLoaded) {
      startMonitoring();
      setupExitPrevention();
    }
    return () => {
      stopMonitoring();
      cleanupExitPrevention();
    };
  }, [isActive, modelsLoaded]);

  // ── Violation Logger ──
  const addViolation = useCallback((type, severity, message) => {
    const violation = {
      id: Date.now(),
      type,
      severity, // 'low', 'medium', 'high', 'critical'
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTime: Date.now()
    };

    violationsRef.current = [...violationsRef.current, violation];
    setViolations(prev => [...prev, violation]);

    // Deduct trust score based on severity
    const deductions = { low: 1, medium: 3, high: 5, critical: 10 };
    setTrustScore(prev => Math.max(0, prev - (deductions[severity] || 2)));

    // Show warning
    showWarning(message, severity);

    // Callback to parent
    if (onViolation) onViolation(violation);
  }, [onViolation]);

  // ── Warning Display ──
  const showWarning = (message, severity) => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setCurrentWarning({ message, severity });
    warningTimeoutRef.current = setTimeout(() => setCurrentWarning(null), 4000);
  };

  // ═══════════════════════════
  // EXIT PREVENTION SYSTEM
  // ═══════════════════════════

  const setupExitPrevention = () => {
    // 1. Prevent page close/refresh
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 2. Detect tab switches
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Detect window blur (alt-tab, clicking outside)
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // 4. Prevent right-click (optional extra layer)
    document.addEventListener('contextmenu', handleContextMenu);

    // 5. Detect keyboard shortcuts (Ctrl+Tab, Alt+Tab, etc.)
    document.addEventListener('keydown', handleKeyDown);

    console.log('Proctor: Exit prevention enabled');
  };

  const cleanupExitPrevention = () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = 'You are in an active interview. Leaving will be recorded.';
    return e.returnValue;
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      tabSwitchStartRef.current = Date.now();
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        const severity = newCount <= 2 ? 'medium' : newCount <= 4 ? 'high' : 'critical';
        addViolation('tab_switch', severity,
          `Tab switch detected (${newCount} total). Stay on the interview tab.`
        );
        return newCount;
      });
    } else if (tabSwitchStartRef.current) {
      const awayDuration = Math.round((Date.now() - tabSwitchStartRef.current) / 1000);
      if (awayDuration > 3) {
        addViolation('tab_away', 'high',
          `Away from interview tab for ${awayDuration} seconds`
        );
      }
      tabSwitchStartRef.current = null;
    }
  };

  const handleWindowBlur = () => {
    addViolation('window_blur', 'low', 'Window focus lost. Please stay on the interview window.');
  };

  const handleWindowFocus = () => {
    // User returned - just log it silently
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    addViolation('right_click', 'low', 'Right-click disabled during interview');
  };

  const handleKeyDown = (e) => {
    // Block certain shortcuts
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u')) {
      // Allow these - not suspicious for interviews
      return;
    }
    // Detect suspicious key combos
    if (e.altKey && e.key === 'Tab') {
      addViolation('alt_tab', 'medium', 'Alt+Tab detected');
    }
    if (e.ctrlKey && e.key === 'Tab') {
      addViolation('ctrl_tab', 'medium', 'Ctrl+Tab detected');
    }
    // Ctrl+W or Ctrl+F4 - closing tab
    if (e.ctrlKey && (e.key === 'w' || e.key === 'F4')) {
      e.preventDefault();
      addViolation('close_attempt', 'high', 'Attempted to close the tab');
    }
  };

  // ═══════════════════════════
  // FACIAL DETECTION SYSTEM
  // ═══════════════════════════

  const startMonitoring = () => {
    if (detectionIntervalRef.current) return;
    setIsMonitoring(true);

    // Run detection every 1.5 seconds
    detectionIntervalRef.current = setInterval(() => {
      detectFace();
    }, 1500);

    console.log('Proctor: Facial monitoring started');
  };

  const stopMonitoring = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsMonitoring(false);
  };

  const detectFace = async () => {
    const video = videoRef?.current;
    // Ensure video is actually playing with valid dimensions
    if (!video || !modelsLoaded) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;
    // Prevent overlapping detections (face-api can take >1.5s)
    if (detectingRef.current) return;
    detectingRef.current = true;

    try {
      // Use larger inputSize (320) and lower scoreThreshold (0.3) for better
      // detection in varied lighting / webcam quality conditions
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.3
        }))
        .withFaceLandmarks()
        .withFaceExpressions();

      // ── NO FACE DETECTED ──
      if (detections.length === 0) {
        noFaceFramesRef.current += 1;
        setFaceStatus('no_face');

        // Only flag after 5 consecutive no-face frames (~7.5 seconds)
        if (noFaceFramesRef.current >= 5) {
          setNoFaceCount(prev => {
            const newCount = prev + 1;
            addViolation('no_face', 'high',
              `No face detected for ${Math.round(noFaceFramesRef.current * 1.5)}s. Please face the camera.`
            );
            return newCount;
          });
          noFaceFramesRef.current = 0; // Reset to avoid flooding
        }
        return;
      }

      noFaceFramesRef.current = 0;

      // ── MULTIPLE FACES DETECTED ──
      if (detections.length > 1) {
        setFaceStatus('multiple_faces');
        setMultipleFaceCount(prev => {
          const newCount = prev + 1;
          addViolation('multiple_faces', 'critical',
            `${detections.length} faces detected. Only the candidate should be visible.`
          );
          return newCount;
        });
        return;
      }

      // ── SINGLE FACE - ANALYZE ──
      const detection = detections[0];
      const landmarks = detection.landmarks;
      const expressions = detection.expressions;

      // Check head pose / looking away
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const jaw = landmarks.getJawOutline();

      // Get face center
      const faceBox = detection.detection.box;
      const faceCenterX = faceBox.x + faceBox.width / 2;
      const faceCenterY = faceBox.y + faceBox.height / 2;

      // Check if face is too far to the side (looking away)
      const videoWidth = video.videoWidth || video.width;
      const videoHeight = video.videoHeight || video.height;
      const normalizedX = faceCenterX / videoWidth;
      const normalizedY = faceCenterY / videoHeight;

      // Eyes distance ratio to detect head turning
      const leftEyeCenter = {
        x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
        y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length
      };
      const rightEyeCenter = {
        x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
        y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length
      };
      const noseCenter = {
        x: nose[3].x, // Nose tip
        y: nose[3].y
      };

      // Calculate nose position relative to eyes (detects left/right head turn)
      const eyeMidX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
      const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
      const noseOffset = Math.abs(noseCenter.x - eyeMidX) / eyeDistance;

      // If nose is significantly off-center, user is looking away
      if (noseOffset > 0.6 || normalizedX < 0.15 || normalizedX > 0.85) {
        setFaceStatus('looking_away');
        setLookAwayCount(prev => {
          const newCount = prev + 1;
          // Only warn every 3rd occurrence to avoid spam
          if (newCount % 3 === 0) {
            addViolation('looking_away', 'medium',
              'Looking away from camera detected. Please face the screen.'
            );
          }
          return newCount;
        });
      } else {
        setFaceStatus('ok');
      }

      // Check for suspicious expressions (optional, less strict)
      const dominantExpression = Object.entries(expressions)
        .sort((a, b) => b[1] - a[1])[0];

      // Track rapid face position changes (potential phone usage / reading)
      if (lastFacePositionRef.current) {
        const dx = Math.abs(faceCenterX - lastFacePositionRef.current.x);
        const dy = Math.abs(faceCenterY - lastFacePositionRef.current.y);
        const movement = Math.sqrt(dx * dx + dy * dy);

        // Large sudden movement might indicate looking at phone/notes
        if (movement > videoWidth * 0.25) {
          addViolation('sudden_movement', 'low',
            'Sudden head movement detected'
          );
        }
      }
      lastFacePositionRef.current = { x: faceCenterX, y: faceCenterY };

    } catch (err) {
      console.warn('Proctor: Detection error:', err);
    } finally {
      detectingRef.current = false;
    }
  };

  // ── Download Report ──
  const downloadReport = () => {
    const report = {
      candidate: userName,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      trustScore: trustScore,
      summary: {
        totalViolations: violations.length,
        tabSwitches: tabSwitchCount,
        noFaceDetections: noFaceCount,
        multipleFaces: multipleFaceCount,
        lookAwayCount: lookAwayCount,
        criticalViolations: violations.filter(v => v.severity === 'critical').length,
        highViolations: violations.filter(v => v.severity === 'high').length
      },
      violations: violations.map(v => ({
        time: v.timestamp,
        type: v.type,
        severity: v.severity,
        description: v.message
      }))
    };

    const header = `================================================================
  HIREDESK INTERVIEW PROCTORING REPORT
================================================================
Candidate:    ${report.candidate}
Date:         ${report.date}
Trust Score:  ${report.trustScore}%
================================================================

SUMMARY
-------
Total Violations:      ${report.summary.totalViolations}
Tab Switches:          ${report.summary.tabSwitches}
No Face Detected:      ${report.summary.noFaceDetections} times
Multiple Faces:        ${report.summary.multipleFaces} times
Looking Away:          ${report.summary.lookAwayCount} times
Critical Violations:   ${report.summary.criticalViolations}
High Violations:       ${report.summary.highViolations}

VERDICT: ${report.trustScore >= 80 ? 'TRUSTED' : report.trustScore >= 50 ? 'SUSPICIOUS' : 'FLAGGED FOR REVIEW'}
================================================================\n\n`;

    const body = violations.length > 0
      ? `DETAILED VIOLATIONS LOG\n${'─'.repeat(50)}\n\n` +
        violations.map((v, i) =>
          `${i + 1}. [${v.timestamp}] [${v.severity.toUpperCase()}] ${v.type.toUpperCase()}\n   ${v.message}\n`
        ).join('\n')
      : 'No violations recorded.\n';

    const footer = `\n================================================================
  End of Proctoring Report
  Generated by HireDesk Interview Platform
================================================================`;

    const content = header + body + footer;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proctor-report-${userName?.replace(/\s+/g, '-') || 'candidate'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrustColor = () => {
    if (trustScore >= 80) return '#00ff88';
    if (trustScore >= 50) return '#ffa500';
    return '#ff4757';
  };

  const getFaceStatusText = () => {
    switch (faceStatus) {
      case 'ok': return 'Face Detected';
      case 'no_face': return 'No Face';
      case 'multiple_faces': return 'Multiple Faces!';
      case 'looking_away': return 'Looking Away';
      case 'detecting': return 'Initializing...';
      default: return 'Monitoring';
    }
  };

  const getFaceStatusIcon = () => {
    switch (faceStatus) {
      case 'ok': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      );
      case 'no_face': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      );
      case 'multiple_faces': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      );
      case 'looking_away': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffa500" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      );
      default: return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
      );
    }
  };

  if (!isActive) return null;

  return (
    <>
      {/* ── Warning Toast ── */}
      {currentWarning && (
        <div className={`proctor-warning proctor-warning-${currentWarning.severity}`}>
          <div className="proctor-warning-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
          </div>
          <div className="proctor-warning-content">
            <span className="proctor-warning-label">Proctoring Alert</span>
            <span className="proctor-warning-msg">{currentWarning.message}</span>
          </div>
        </div>
      )}

      {/* ── Proctor Status Badge ── */}
      <div className={`proctor-badge ${proctorMinimized ? 'minimized' : ''}`}>
        <div className="proctor-badge-header" onClick={() => setProctorMinimized(!proctorMinimized)}>
          <div className="proctor-badge-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4F223" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="proctor-badge-title">Proctoring</span>
          </div>
          <div className="proctor-trust" style={{ color: getTrustColor() }}>
            {trustScore}%
          </div>
        </div>

        {!proctorMinimized && (
          <div className="proctor-badge-body">
            {/* Face Status */}
            <div className="proctor-stat">
              {getFaceStatusIcon()}
              <span className={`proctor-face-label proctor-face-${faceStatus}`}>{getFaceStatusText()}</span>
            </div>

            {/* Violation Counts */}
            <div className="proctor-stats-grid">
              <div className="proctor-stat-item">
                <span className="proctor-stat-num" style={{ color: tabSwitchCount > 0 ? '#ff4757' : '#555' }}>{tabSwitchCount}</span>
                <span className="proctor-stat-label">Tab Switches</span>
              </div>
              <div className="proctor-stat-item">
                <span className="proctor-stat-num" style={{ color: noFaceCount > 0 ? '#ffa500' : '#555' }}>{noFaceCount}</span>
                <span className="proctor-stat-label">No Face</span>
              </div>
              <div className="proctor-stat-item">
                <span className="proctor-stat-num" style={{ color: multipleFaceCount > 0 ? '#ff4757' : '#555' }}>{multipleFaceCount}</span>
                <span className="proctor-stat-label">Multi Face</span>
              </div>
              <div className="proctor-stat-item">
                <span className="proctor-stat-num" style={{ color: lookAwayCount > 0 ? '#ffa500' : '#555' }}>{lookAwayCount}</span>
                <span className="proctor-stat-label">Look Away</span>
              </div>
            </div>

            {/* Actions */}
            <div className="proctor-actions">
              <button onClick={() => setShowReport(true)} className="proctor-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Report
              </button>
              <button onClick={downloadReport} className="proctor-action-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Full Report Modal ── */}
      {showReport && (
        <div className="proctor-report-overlay" onClick={() => setShowReport(false)}>
          <div className="proctor-report-modal" onClick={e => e.stopPropagation()}>
            <div className="proctor-report-header">
              <h3>Proctoring Report</h3>
              <button className="proctor-report-close" onClick={() => setShowReport(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="proctor-report-body">
              {/* Trust Score */}
              <div className="proctor-report-score">
                <div className="proctor-score-circle" style={{ borderColor: getTrustColor() }}>
                  <span className="proctor-score-value" style={{ color: getTrustColor() }}>{trustScore}%</span>
                  <span className="proctor-score-label">Trust Score</span>
                </div>
                <div className="proctor-verdict" style={{ color: getTrustColor() }}>
                  {trustScore >= 80 ? 'TRUSTED' : trustScore >= 50 ? 'SUSPICIOUS' : 'FLAGGED FOR REVIEW'}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="proctor-summary-grid">
                <div className="proctor-summary-card"><span className="proctor-summary-num">{tabSwitchCount}</span><span>Tab Switches</span></div>
                <div className="proctor-summary-card"><span className="proctor-summary-num">{noFaceCount}</span><span>No Face</span></div>
                <div className="proctor-summary-card"><span className="proctor-summary-num">{multipleFaceCount}</span><span>Multiple Faces</span></div>
                <div className="proctor-summary-card"><span className="proctor-summary-num">{lookAwayCount}</span><span>Look Away</span></div>
              </div>

              {/* Violation Log */}
              <div className="proctor-log">
                <h4>Violation Log ({violations.length})</h4>
                {violations.length === 0 ? (
                  <p className="proctor-no-violations">No violations recorded. Candidate behavior is clean.</p>
                ) : (
                  <div className="proctor-log-list">
                    {violations.map((v, i) => (
                      <div key={v.id} className={`proctor-log-item proctor-sev-${v.severity}`}>
                        <span className="proctor-log-time">{v.timestamp}</span>
                        <span className={`proctor-log-severity`}>{v.severity.toUpperCase()}</span>
                        <span className="proctor-log-msg">{v.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Download */}
              <button onClick={downloadReport} className="proctor-download-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewProctor;
