import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import toast from 'react-hot-toast';
import InterviewProctor from './InterviewProctor';
import './PeerVideoCall.css';

const PeerVideoCall = ({ roomId, userName, isAdmin = false }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remotePeers, setRemotePeers] = useState({});
  const [peerNames, setPeerNames] = useState({});
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [myRole, setMyRole] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  // Transcript state (admin only)
  const [captionsOn, setCaptionsOn] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Tab switch blocking (recruiter-controlled)
  const [tabSwitchBlocked, setTabSwitchBlocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const tabSwitchBlockedRef = useRef(false);
  const dataConnRef = useRef(null);
  const dataConnsRef = useRef([]);

  // Proctoring state - admin selects which remote participant to proctor
  const [proctorTarget, setProctorTarget] = useState(null); // peerId of the participant being proctored
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);
  const remoteVideoRefs = useRef({});
  
  // Fullscreen lock state for tab-switch prevention
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(false);
  const [showViolationOverlay, setShowViolationOverlay] = useState(false);
  const [remoteCaptions, setRemoteCaptions] = useState({});
  const remoteCaptionsTimerRef = useRef({});
  
  const localVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallsRef = useRef({});
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);

  const cleanRoomId = roomId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);

  // ── Call Duration Timer ──
  useEffect(() => {
    if (connectionStatus === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [connectionStatus]);

  // ── Speech Recognition Setup ──
  useEffect(() => {
    if (captionsOn) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
    return () => stopSpeechRecognition();
  }, [captionsOn]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  // Keep ref in sync with state for use in closures
  useEffect(() => { tabSwitchBlockedRef.current = tabSwitchBlocked; }, [tabSwitchBlocked]);

  // Tab switch blocking - fullscreen-based prevention for candidates
  useEffect(() => {
    if (!isAdmin && tabSwitchBlockedRef.current) {
      // Request fullscreen for candidates when tab switching is blocked
      const requestFullscreen = async () => {
        try {
          const elem = document.documentElement;
          if (!document.fullscreenElement) {
            await (elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen).call(elem);
            setIsFullscreenLocked(true);
          }
        } catch (e) {
          console.warn('Fullscreen request failed:', e);
        }
      };
      requestFullscreen();
    } else if (!isAdmin && !tabSwitchBlockedRef.current && isFullscreenLocked) {
      // Exit fullscreen when tab switching is unblocked
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreenLocked(false);
    }
  }, [tabSwitchBlocked, isAdmin]);

  // Fullscreen exit detection - re-enter fullscreen if candidate tries to exit while blocked
  useEffect(() => {
    if (!isAdmin) {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && tabSwitchBlockedRef.current) {
          // Candidate exited fullscreen while blocked - re-enter and log violation
          reportViolationToAdmin('fullscreen_exit', 'Candidate exited fullscreen while tab lock is active');
          toast.error("You cannot leave fullscreen during the interview!", {
            duration: 4000,
            style: { background: '#1a1a2e', color: '#ff4757', border: '1px solid #ff4757', fontWeight: 'bold' },
            iconTheme: { primary: '#ff4757', secondary: '#1a1a2e' }
          });
          setShowViolationOverlay(true);
          // Re-enter fullscreen
          setTimeout(async () => {
            try {
              const elem = document.documentElement;
              if (!document.fullscreenElement && tabSwitchBlockedRef.current) {
                await (elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen).call(elem);
              }
            } catch (e) {
              console.warn('Re-fullscreen failed:', e);
            }
          }, 500);
        }
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
  }, [isAdmin]);

  // Tab switch blocking - prevent leaving + warn
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden && tabSwitchBlockedRef.current) {
        reportViolationToAdmin('tab_switch', 'Candidate switched away from the interview tab');
        toast.error("You can't switch tabs during the interview!", {
          duration: 4000,
          style: { background: '#1a1a2e', color: '#ff4757', border: '1px solid #ff4757', fontWeight: 'bold' },
          iconTheme: { primary: '#ff4757', secondary: '#1a1a2e' }
        });
        // For candidates, force focus back and show lock overlay
        if (!isAdmin) {
          setShowViolationOverlay(true);
          setTimeout(() => window.focus(), 100);
        }
      }
    };

    const handleBeforeUnload = (e) => {
      if (tabSwitchBlockedRef.current && !isAdmin) {
        e.preventDefault();
        e.returnValue = 'You cannot leave during the interview. Tab switching is disabled.';
        return e.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleTabSwitch);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleTabSwitch);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAdmin]);

  useEffect(() => {
    startCall();
    return () => cleanup();
  }, []);

  // ── Speech Recognition ──
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      setCurrentCaption('Live captions not supported in this browser. Please use Chrome or Edge.');
      setTimeout(() => setCurrentCaption(''), 5000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show live caption
      if (interimTranscript) {
        setCurrentCaption(interimTranscript);
      }

      // Add final transcript entry
      if (finalTranscript.trim()) {
        const entry = {
          id: Date.now(),
          speaker: userName || 'You',
          text: finalTranscript.trim(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          duration: formatTime(callDuration)
        };
        setTranscript(prev => [...prev, entry]);
        setCurrentCaption('');
        
        // Broadcast final caption to peers
        const captionData = { type: 'caption', text: finalTranscript.trim(), isFinal: true, name: userName };
        if (myRole === 'host') {
          dataConnsRef.current.forEach(conn => { try { conn.send(captionData); } catch(e) {} });
        } else if (dataConnRef.current) {
          try { dataConnRef.current.send(captionData); } catch(e) {}
        }
      } else if (interimTranscript) {
        // Broadcast interim caption to peers
        const captionData = { type: 'caption', text: interimTranscript, isFinal: false, name: userName };
        if (myRole === 'host') {
          dataConnsRef.current.forEach(conn => { try { conn.send(captionData); } catch(e) {} });
        } else if (dataConnRef.current) {
          try { dataConnRef.current.send(captionData); } catch(e) {}
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setCurrentCaption('Microphone access needed for captions');
        setTimeout(() => setCurrentCaption(''), 4000);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        // Auto-restart on transient errors
        setTimeout(() => {
          if (captionsOn && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch(e) {}
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if captions are still on
      if (captionsOn) {
        setTimeout(() => {
          try { recognition.start(); } catch(e) {}
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentCaption('');
  };

  const toggleCaptions = () => {
    setCaptionsOn(prev => {
      const newVal = !prev;
      if (isAdmin) {
        dataConnsRef.current.forEach(conn => {
          try {
            conn.send({
              type: 'settings',
              tabSwitchBlocked: tabSwitchBlockedRef.current,
              captionsEnabled: newVal
            });
          } catch (e) {}
        });
      }
      return newVal;
    });
  };

  const downloadTranscript = () => {
    if (transcript.length === 0) return;

    const header = `═══════════════════════════════════════════
  HireDesk Interview Transcript
═══════════════════════════════════════════
Room: ${roomId}
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Duration: ${formatTime(callDuration)}
Participants: ${userName}
═══════════════════════════════════════════\n\n`;

    const body = transcript.map(entry => 
      `[${entry.timestamp}] ${entry.speaker}:\n${entry.text}\n`
    ).join('\n');

    const footer = `\n═══════════════════════════════════════════
  End of Transcript
  Generated by HireDesk Interview Platform
═══════════════════════════════════════════`;

    const content = header + body + footer;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${roomId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Utility ──
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const cleanup = () => {
    stopSpeechRecognition();
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    Object.values(activeCallsRef.current).forEach(c => { try { c.close(); } catch(e) {} });
    if (dataConnRef.current) { try { dataConnRef.current.close(); } catch(e) {} }
    dataConnsRef.current.forEach(c => { try { c.close(); } catch(e) {} });
    if (peerRef.current) { try { peerRef.current.destroy(); } catch(e) {} }
  };

  // ── PeerJS Connection ──
  const startCall = async () => {
    // Check for secure context - getUserMedia requires HTTPS or localhost
    if (!window.isSecureContext || !navigator.mediaDevices) {
      setError(
        'Camera/microphone access requires a secure (HTTPS) connection. ' +
        'The current page is served over HTTP, which blocks media device access. ' +
        'Please contact your administrator to enable HTTPS.'
      );
      setConnectionStatus('error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 48000
        }
      });
      // Start participants muted by default to avoid join-time feedback/howling.
      if (!isAdmin) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = false;
          setIsAudioOn(false);
        }
      }
      setLocalStream(stream);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      tryBecomeHost(stream);
    } catch (err) {
      if (err.name === 'NotAllowedError') setError('Camera/microphone permission denied. Click the lock icon in the address bar to allow access.');
      else if (err.name === 'NotFoundError') setError('No camera or microphone detected.');
      else if (err.name === 'NotReadableError') setError('Camera/microphone is being used by another application.');
      else setError(`Unable to access media: ${err.message}`);
      setConnectionStatus('error');
    }
  };

  const tryBecomeHost = (stream) => {
    const hostId = `hd-${cleanRoomId}-host`;
    const peer = new Peer(hostId, {
      config: { iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]}
    });
    peer.on('open', () => {
      peerRef.current = peer; setMyRole('host'); setConnectionStatus('connected');
      setupHostListeners(peer, stream);
    });
    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') { peer.destroy(); joinAsGuest(stream); }
      else if (err.type !== 'peer-unavailable') setConnectionStatus('server-error');
    });
  };

  const setupHostListeners = (peer, stream) => {
    peer.on('call', (call) => {
      const remoteName = call.metadata?.name || 'Participant';
      setPeerNames(prev => ({...prev, [call.peer]: remoteName}));
      call.answer(stream);
      call.on('stream', (rs) => addRemoteStream(call.peer, rs));
      call.on('close', () => removeRemoteStream(call.peer));
      call.on('error', () => removeRemoteStream(call.peer));
      activeCallsRef.current[call.peer] = call;
    });
    // Data connection listener for settings sync and name exchange
    peer.on('connection', (conn) => {
      conn.on('open', () => {
        dataConnsRef.current.push(conn);
        conn.send({ type: 'identity', name: userName });
        conn.send({
          type: 'settings',
          tabSwitchBlocked: tabSwitchBlockedRef.current,
          captionsEnabled: captionsOn
        });
      });
      conn.on('data', (data) => {
        if (data.type === 'identity') {
          setPeerNames(prev => ({...prev, [conn.peer]: data.name}));
        }
        if (data.type === 'settings') {
          if (!isAdmin) {
            if (typeof data.tabSwitchBlocked === 'boolean') setTabSwitchBlocked(data.tabSwitchBlocked);
            if (typeof data.captionsEnabled === 'boolean') setCaptionsOn(data.captionsEnabled);
          }
        }
        if (data.type === 'caption') {
          handleRemoteCaption(conn.peer, data.text, data.name || 'Participant', data.isFinal);
          // Relay one participant's captions to all others so everyone stays in sync.
          dataConnsRef.current.forEach(target => {
            if (target !== conn) {
              try { target.send(data); } catch (e) {}
            }
          });
        }
        if (data.type === 'violation' && isAdmin) {
          const violator = data.name || peerNames[conn.peer] || 'Participant';
          toast.error(
            `${violator}: ${data.message || 'Policy violation detected'}`,
            {
              duration: 6000,
              style: {
                background: '#2b0d12',
                color: '#ff6b81',
                border: '1px solid #ff4757',
                fontWeight: 'bold'
              },
              iconTheme: { primary: '#ff4757', secondary: '#2b0d12' }
            }
          );
        }
      });
      conn.on('close', () => {
        dataConnsRef.current = dataConnsRef.current.filter(c => c !== conn);
      });
    });
    peer.on('disconnected', () => {
      setConnectionStatus('reconnecting');
      setTimeout(() => { if (peer && !peer.destroyed) peer.reconnect(); }, 2000);
    });
  };

  const joinAsGuest = (stream) => {
    const guestId = `hd-${cleanRoomId}-g${Date.now()}`;
    const peer = new Peer(guestId, {
      config: { iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]}
    });
    peer.on('open', () => {
      peerRef.current = peer; setMyRole('guest'); setConnectionStatus('connected');
      callHost(peer, stream);
      // Data connection to host for settings sync and name exchange
      const hostId = `hd-${cleanRoomId}-host`;
      const conn = peer.connect(hostId);
      conn.on('open', () => {
        dataConnRef.current = conn;
        conn.send({ type: 'identity', name: userName });
      });
      conn.on('data', (data) => {
        if (data.type === 'identity') {
          setPeerNames(prev => ({...prev, [hostId]: data.name}));
        }
        if (data.type === 'settings') {
          if (typeof data.tabSwitchBlocked === 'boolean') setTabSwitchBlocked(data.tabSwitchBlocked);
          if (typeof data.captionsEnabled === 'boolean') setCaptionsOn(data.captionsEnabled);
        }
        if (data.type === 'caption') {
          handleRemoteCaption(hostId, data.text, data.name || 'Participant', data.isFinal);
        }
        if (data.type === 'violation' && isAdmin) {
          const violator = data.name || peerNames[hostId] || 'Participant';
          toast.error(
            `${violator}: ${data.message || 'Policy violation detected'}`,
            {
              duration: 6000,
              style: {
                background: '#2b0d12',
                color: '#ff6b81',
                border: '1px solid #ff4757',
                fontWeight: 'bold'
              },
              iconTheme: { primary: '#ff4757', secondary: '#2b0d12' }
            }
          );
        }
      });
      peer.on('call', (call) => {
        const remoteName = call.metadata?.name || 'Participant';
        setPeerNames(prev => ({...prev, [call.peer]: remoteName}));
        call.answer(stream);
        call.on('stream', (rs) => addRemoteStream(call.peer, rs));
        call.on('close', () => removeRemoteStream(call.peer));
        call.on('error', () => removeRemoteStream(call.peer));
        activeCallsRef.current[call.peer] = call;
      });
    });
    peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') setTimeout(() => { if (peer && !peer.destroyed) callHost(peer, stream); }, 3000);
    });
    peer.on('disconnected', () => {
      setConnectionStatus('reconnecting');
      setTimeout(() => { if (peer && !peer.destroyed) peer.reconnect(); }, 2000);
    });
  };

  const callHost = (peer, stream) => {
    const hostId = `hd-${cleanRoomId}-host`;
    const call = peer.call(hostId, stream, { metadata: { name: userName } });
    if (!call) return;
    call.on('stream', (rs) => addRemoteStream(hostId, rs));
    call.on('close', () => removeRemoteStream(hostId));
    call.on('error', () => {});
    activeCallsRef.current[hostId] = call;
  };

  const addRemoteStream = (peerId, stream) => setRemotePeers(prev => ({ ...prev, [peerId]: stream }));
  const removeRemoteStream = (peerId) => {
    delete activeCallsRef.current[peerId];
    setRemotePeers(prev => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    setPeerNames(prev => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
    if (proctorTarget === peerId) {
      setProctorTarget(null);
    }
  };
  
  const handleRemoteCaption = (peerId, text, name, isFinal = false) => {
    setRemoteCaptions(prev => ({ ...prev, [peerId]: { text, name } }));
    if (isFinal && text?.trim()) {
      const entry = {
        id: `${peerId}-${Date.now()}`,
        speaker: name || 'Participant',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        duration: formatTime(callDuration)
      };
      setTranscript(prev => [...prev, entry]);
    }
    
    // Clear existing timer for this peer
    if (remoteCaptionsTimerRef.current[peerId]) {
      clearTimeout(remoteCaptionsTimerRef.current[peerId]);
    }
    
    // Set timer to clear caption after 5 seconds of no updates
    remoteCaptionsTimerRef.current[peerId] = setTimeout(() => {
      setRemoteCaptions(prev => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    }, 5000);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getVideoTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsVideoOn(t.enabled); }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const t = localStreamRef.current.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; setIsAudioOn(t.enabled); }
    }
  };

  const copyRoomLink = () => {
    const code = roomId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
    const canonicalBase = 'https://hiredesk.duckdns.org';
    const interviewUrl = `${canonicalBase}/interview/room/${roomId}`;
    const linkText = `Join Interview : ${code}`;
    const plainTextContent = `${linkText}\n${interviewUrl}`;
    
    // WhatsApp and similar apps are more reliable with plain text clipboard.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(plainTextContent).then(() => {
        setIsCopied(true); setTimeout(() => setIsCopied(false), 3000);
      }).catch(() => fallbackCopy(plainTextContent));
    } else {
      fallbackCopy(plainTextContent);
    }
  };

  const fallbackCopy = (text) => {
    // Fallback: create a temporary input, select, and copy
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      setIsCopied(true); setTimeout(() => setIsCopied(false), 3000);
    } catch {
      window.prompt('Copy this interview link:', text);
    }
    document.body.removeChild(input);
  };

  const endCall = () => { 
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    cleanup(); 
    if (isAdmin) {
      window.location.href = '/interviews';
      return;
    }
    window.location.href = '/candidate-dashboard';
  };

  const toggleTabSwitchBlocked = () => {
    setTabSwitchBlocked(prev => {
      const newVal = !prev;
      tabSwitchBlockedRef.current = newVal;
      dataConnsRef.current.forEach(conn => {
        try {
          conn.send({
            type: 'settings',
            tabSwitchBlocked: newVal,
            captionsEnabled: captionsOn
          });
        } catch (e) {}
      });
      toast(newVal ? 'Tab switching disabled for all participants' : 'Tab switching enabled', {
        icon: newVal ? '🔒' : '🔓',
        style: { background: '#1a1a2e', color: '#fff', border: `1px solid ${newVal ? '#ff4757' : '#00ff88'}` }
      });
      return newVal;
    });
  };

  const reportViolationToAdmin = (type, message) => {
    const payload = { type: 'violation', violationType: type, message, name: userName };
    if (myRole === 'guest' && dataConnRef.current) {
      try { dataConnRef.current.send(payload); } catch (e) {}
    } else if (myRole === 'host') {
      dataConnsRef.current.forEach(conn => {
        try { conn.send(payload); } catch (e) {}
      });
    }
  };

  const remoteCount = Object.keys(remotePeers).length;
  const totalParticipants = remoteCount + 1;

  // ── ERROR STATE ──
  if (error) {
    const isHttpsError = !window.isSecureContext || error.includes('HTTPS');
    return (
      <div className="vc-error-screen">
        <div className="vc-error-card">
          <div className="vc-error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="1.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><line x1="1" y1="1" x2="23" y2="23" strokeWidth="2"/></svg>
          </div>
          <h2>Unable to Join</h2>
          <p className="vc-error-msg">{error}</p>
          <div className="vc-error-help">
            <h4>Quick Fix:</h4>
            {isHttpsError ? (
              <div className="vc-help-steps">
                <div className="vc-help-step"><span className="vc-step-num">1</span><span>Video calls require <strong>HTTPS</strong> — browsers block camera/mic on HTTP</span></div>
                <div className="vc-help-step"><span className="vc-step-num">2</span><span>Ask your admin to enable <strong>SSL/HTTPS</strong> on the server</span></div>
                <div className="vc-help-step"><span className="vc-step-num">3</span><span>Or access via <strong>localhost</strong> for local testing</span></div>
              </div>
            ) : (
              <div className="vc-help-steps">
                <div className="vc-help-step"><span className="vc-step-num">1</span><span>Click the <strong>lock icon</strong> in the address bar</span></div>
                <div className="vc-help-step"><span className="vc-step-num">2</span><span>Set <strong>Camera</strong> and <strong>Microphone</strong> to "Allow"</span></div>
                <div className="vc-help-step"><span className="vc-step-num">3</span><span>Click <strong>Try Again</strong> below</span></div>
              </div>
            )}
          </div>
          <div className="vc-error-actions">
            {!isHttpsError && (
              <button onClick={() => window.location.reload()} className="vc-btn vc-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Try Again
              </button>
            )}
            <button onClick={() => window.history.back()} className="vc-btn vc-btn-ghost">← Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN UI ──
  return (
    <div className="vc-container" onMouseMove={() => setShowControls(true)}>
      
      {/* ── Strict Tab-Switch Violation Overlay ── */}
      {showViolationOverlay && !isAdmin && (
        <div className="vc-violation-overlay">
          <div className="vc-violation-card">
            <div className="vc-violation-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
            </div>
            <h2>ACCESS RESTRICTED</h2>
            <p>Tab switching and leaving the interview window is strictly prohibited.</p>
            <div className="vc-violation-instruction">
              Focus the browser window and stay in fullscreen to continue.
            </div>
            <button 
              onClick={() => {
                if (!document.hidden) {
                  setShowViolationOverlay(false);
                  // Try to re-enter fullscreen
                  const elem = document.documentElement;
                  if (!document.fullscreenElement && tabSwitchBlockedRef.current) {
                    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
                    if (req) req.call(elem).catch(() => {});
                  }
                } else {
                  toast.error("Please focus this tab first!");
                }
              }} 
              className="vc-btn vc-btn-primary"
            >
              I Understand - Return to Interview
            </button>
          </div>
        </div>
      )}
      
      {/* ── Top Bar ── */}
      <div className={`vc-topbar ${showControls ? 'visible' : ''}`}>
        <div className="vc-topbar-left">
          <div className="vc-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <span className="vc-logo-text">HireDesk Interview</span>
          </div>
          <div className="vc-separator" />
          <div className="vc-timer">{formatTime(callDuration)}</div>
          <div className="vc-separator" />
          <div className={`vc-status vc-status-${connectionStatus}`}>
            <span className="vc-status-dot" />
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'connected' && `${totalParticipants} in call`}
            {connectionStatus === 'server-error' && 'Limited connection'}
            {connectionStatus === 'reconnecting' && 'Reconnecting...'}
          </div>
        </div>
        <div className="vc-topbar-right">
          {isAdmin && (
            <button onClick={copyRoomLink} className={`vc-btn-icon vc-invite-btn ${isCopied ? 'copied' : ''}`} title="Copy meeting link">
              {isCopied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              )}
              <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          )}
          {isAdmin && transcript.length > 0 && (
            <button onClick={downloadTranscript} className="vc-btn-icon" title="Download transcript">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Transcript</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Video Grid ── */}
      <div className="vc-video-area">
        <div className={`vc-grid vc-grid-${Math.min(totalParticipants, 4)} ${showTranscript ? 'vc-grid-with-panel' : ''}`}>
          {/* Local Video */}
          <div className={`vc-video-tile ${remoteCount === 0 ? 'vc-solo' : ''}`}>
            <video ref={localVideoRef} autoPlay playsInline muted className="vc-video" />
            {!isVideoOn && (
              <div className="vc-video-off">
                <div className="vc-avatar">{userName.charAt(0).toUpperCase()}</div>
              </div>
            )}
            <div className="vc-video-info">
              <span className="vc-name">{userName} (You)</span>
              {!isAudioOn && (
                <span className="vc-muted-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.35 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </span>
              )}
              {captionsOn && isListening && (
                <span className="vc-listening-badge">
                  <span className="vc-listening-dot" />CC
                </span>
              )}
            </div>
          </div>

          {/* Remote Videos */}
          {Object.entries(remotePeers).map(([peerId, stream]) => (
            <div key={peerId} className="vc-video-tile" onClick={() => isAdmin && setShowParticipantPicker(false)}>
              <video ref={(el) => { 
                if (el && el.srcObject !== stream) el.srcObject = stream;
                remoteVideoRefs.current[peerId] = el;
              }} autoPlay playsInline className="vc-video" />
              <div className="vc-video-info">
                <span className="vc-name">{peerNames[peerId] || 'Participant'}</span>
                {isAdmin && proctorTarget !== peerId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setProctorTarget(peerId); }}
                    style={{
                      marginLeft: '8px', fontSize: '11px', background: '#00ff88', color: '#000', 
                      border: 'none', borderRadius: '12px', padding: '2px 10px', cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Start Proctoring
                  </button>
                )}
                {isAdmin && proctorTarget === peerId && (
                  <span style={{
                    marginLeft: '8px', fontSize: '11px', background: 'rgba(0,255,136,0.15)', color: '#00ff88',
                    borderRadius: '12px', padding: '2px 10px', fontWeight: 'bold'
                  }}>
                    Proctoring Active
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Waiting Panel */}
          {remoteCount === 0 && (
            <div className="vc-video-tile vc-waiting-tile">
              <div className="vc-waiting">
                <div className="vc-waiting-animation">
                  <div className="vc-pulse-ring" /><div className="vc-pulse-ring delay-1" /><div className="vc-pulse-ring delay-2" />
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="1.5" className="vc-waiting-icon"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3>Waiting for participants...</h3>
                <p>Share the meeting link to add people</p>
                <button onClick={copyRoomLink} className="vc-btn vc-btn-primary vc-btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  {isCopied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Transcript Side Panel ── */}
        {showTranscript && (
          <div className="vc-transcript-panel">
            <div className="vc-transcript-header">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Transcript
              </h3>
              <div className="vc-transcript-actions">
                {transcript.length > 0 && (
                  <button onClick={downloadTranscript} className="vc-btn-icon-sm" title="Download">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                )}
                <button onClick={() => setShowTranscript(false)} className="vc-btn-icon-sm" title="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="vc-transcript-body">
              {transcript.length === 0 ? (
                <div className="vc-transcript-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  <p>Turn on captions to start recording the transcript</p>
                  {!captionsOn && (
                    <button onClick={toggleCaptions} className="vc-btn vc-btn-primary vc-btn-sm">Enable Captions</button>
                  )}
                </div>
              ) : (
                transcript.map(entry => (
                  <div key={entry.id} className="vc-transcript-entry">
                    <div className="vc-transcript-meta">
                      <span className="vc-transcript-speaker">{entry.speaker}</span>
                      <span className="vc-transcript-time">{entry.timestamp}</span>
                    </div>
                    <p className="vc-transcript-text">{entry.text}</p>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* ── Live Caption Bar (Multi-user) ── */}
      {(captionsOn || Object.keys(remoteCaptions).length > 0) && (
        <div className="vc-caption-bar">
          {/* Local caption */}
          {captionsOn && currentCaption && (
            <div className="vc-caption-content">
              <span className="vc-caption-speaker">{userName}:</span>
              <span className="vc-caption-text">{currentCaption}</span>
            </div>
          )}
          
          {/* Remote captions */}
          {Object.entries(remoteCaptions).map(([peerId, data]) => (
            <div key={peerId} className="vc-caption-content">
              <span className="vc-caption-speaker">{data.name}:</span>
              <span className="vc-caption-text">{data.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom Controls ── */}
      <div className={`vc-controls ${showControls ? 'visible' : ''}`}>
        <div className="vc-controls-center">
          {/* Mic - available for everyone */}
          <button onClick={toggleAudio} className={`vc-ctrl-btn ${!isAudioOn ? 'vc-ctrl-off' : ''}`} title={isAudioOn ? 'Mute' : 'Unmute'}>
            {isAudioOn ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.5-.35 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            )}
            <span className="vc-ctrl-label">{isAudioOn ? 'Mute' : 'Unmute'}</span>
          </button>

          {/* Camera - available for everyone */}
          <button onClick={toggleVideo} className={`vc-ctrl-btn ${!isVideoOn ? 'vc-ctrl-off' : ''}`} title={isVideoOn ? 'Camera off' : 'Camera on'}>
            {isVideoOn ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
            <span className="vc-ctrl-label">{isVideoOn ? 'Camera' : 'Camera Off'}</span>
          </button>

          {/* Admin/Recruiter-only: Settings menu with captions, transcript, tab-switch control */}
          {isAdmin && (
            <div style={{position: 'relative'}}>
              <button onClick={() => setShowSettings(!showSettings)} className={`vc-ctrl-btn ${showSettings ? 'vc-ctrl-active' : ''}`} title="Interview settings">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                <span className="vc-ctrl-label">Settings</span>
              </button>
              {showSettings && (
                <div style={{position: 'absolute', bottom: '70px', left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '16px', width: '280px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)'}}>
                  <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff', marginBottom: '14px'}}>Interview Settings</div>
                  
                  {/* Enable Captions toggle */}
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <span style={{fontSize: '12px', color: '#ccc'}}>Enable Captions</span>
                    <button 
                      onClick={toggleCaptions}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: captionsOn ? '#00ff88' : '#333',
                        position: 'relative', transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px', transition: 'left 0.2s',
                        left: captionsOn ? '23px' : '3px'
                      }} />
                    </button>
                  </div>

                  {/* Transcript toggle */}
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <span style={{fontSize: '12px', color: '#ccc'}}>Show Transcript</span>
                    <button 
                      onClick={() => setShowTranscript(!showTranscript)}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: showTranscript ? '#00ff88' : '#333',
                        position: 'relative', transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px', transition: 'left 0.2s',
                        left: showTranscript ? '23px' : '3px'
                      }} />
                    </button>
                  </div>

                  {/* Disable Tab Switching toggle */}
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span style={{fontSize: '12px', color: '#ccc'}}>Disable Tab Switching</span>
                    <button 
                      onClick={toggleTabSwitchBlocked}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: tabSwitchBlocked ? '#ff4757' : '#333',
                        position: 'relative', transition: 'background 0.2s'
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px', transition: 'left 0.2s',
                        left: tabSwitchBlocked ? '23px' : '3px'
                      }} />
                    </button>
                  </div>
                  {tabSwitchBlocked && (
                    <p style={{fontSize: '10px', color: '#ff4757', marginTop: '8px', lineHeight: '1.4'}}>
                      Candidates will be locked in fullscreen and cannot switch tabs or leave this page.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Leave - available for everyone */}
          <button onClick={endCall} className="vc-ctrl-btn vc-ctrl-end" title="Leave call">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4z" transform="rotate(135 12 12)"/></svg>
            <span className="vc-ctrl-label">Leave</span>
          </button>
        </div>
      </div>

      {/* Interview Proctoring System - Admin only, targets select remote participant */}
      {isAdmin && proctorTarget && remoteVideoRefs.current[proctorTarget] && (
        <InterviewProctor
          videoRef={{ current: remoteVideoRefs.current[proctorTarget] }}
          isActive={connectionStatus === 'connected' || connectionStatus === 'connecting'}
          userName={peerNames[proctorTarget] || 'Participant'}
          onViolation={(v) => console.log('Proctor violation:', v.type, v.message)}
        />
      )}
    </div>
  );
};

export default PeerVideoCall;
