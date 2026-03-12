import React, { useEffect, useRef, useState } from 'react';
import './SimpleVideoCall.css';

const SimpleVideoCall = ({ roomId, userName }) => {
  const [localStream, setLocalStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);

  useEffect(() => {
    startLocalStream();
    
    return () => {
      stopLocalStream();
    };
  }, []);

  const startLocalStream = async () => {
    // Check for secure context - getUserMedia requires HTTPS or localhost
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setError(
        'Camera/microphone access requires a secure (HTTPS) connection. ' +
        'The current page is served over HTTP, which blocks media device access. ' +
        'Please contact your administrator to enable HTTPS.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Unable to access camera/microphone. Please grant permissions and try again.');
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const copyRoomLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const endCall = () => {
    stopLocalStream();
    window.history.back();
  };

  if (error) {
    return (
      <div className="video-call-error">
        <div className="error-content">
          <h2>⚠️ Camera/Microphone Access Required</h2>
          <p>{error}</p>
          <button onClick={startLocalStream} className="retry-btn">
            🔄 Try Again
          </button>
          <button onClick={() => window.history.back()} className="back-btn">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-video-call">
      {/* Header */}
      <div className="video-call-header">
        <div className="room-info">
          <h3>🎥 Interview Room</h3>
          <p className="room-id">Room: {roomId}</p>
        </div>
        <button 
          onClick={copyRoomLink} 
          className={`copy-link-btn ${isCopied ? 'copied' : ''}`}
        >
          {isCopied ? '✅ Copied!' : '🔗 Copy Link'}
        </button>
      </div>

      {/* Video Grid */}
      <div className="video-grid">
        {/* Local Video */}
        <div className="video-container local-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          />
          <div className="video-label">
            <span className="user-name">{userName} (You)</span>
            {!isVideoOn && <span className="status-badge">📷 Off</span>}
            {!isAudioOn && <span className="status-badge">🎤 Muted</span>}
          </div>
        </div>

        {/* Waiting for others */}
        <div className="video-container waiting-container">
          <div className="waiting-content">
            <div className="waiting-icon">⏳</div>
            <h3>Waiting for others to join...</h3>
            <p>Share the room link with participants</p>
            <button onClick={copyRoomLink} className="share-btn">
              📋 Copy & Share Link
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button
          onClick={toggleAudio}
          className={`control-btn ${!isAudioOn ? 'off' : ''}`}
          title={isAudioOn ? 'Mute' : 'Unmute'}
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>

        <button
          onClick={toggleVideo}
          className={`control-btn ${!isVideoOn ? 'off' : ''}`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? '📹' : '📷'}
        </button>

        <button
          onClick={endCall}
          className="control-btn end-call"
          title="End call"
        >
          📞 End Call
        </button>

        <button
          onClick={copyRoomLink}
          className="control-btn"
          title="Copy room link"
        >
          🔗
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions-panel">
        <h4>💡 How to add participants:</h4>
        <ol>
          <li>Click "🔗 Copy Link" button above</li>
          <li>Share the link with candidates or other interviewers</li>
          <li>They will join this room automatically</li>
        </ol>
        <p className="note">
          <strong>Note:</strong> This is a simplified video interface for local testing. 
          For production, consider using a WebRTC signaling server for multi-party calls.
        </p>
      </div>
    </div>
  );
};

export default SimpleVideoCall;
