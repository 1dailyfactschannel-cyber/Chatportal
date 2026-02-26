import { useState, useEffect, useRef } from 'react';
import { 
  startCall, 
  acceptCall, 
  rejectCall, 
  endCallLocal, 
  toggleMute, 
  toggleVideo,
  startScreenShare,
  stopScreenShare,
  getLocalStream,
  getRemoteStream,
  type CallState 
} from '../../services/websocket';

interface CallModalProps {
  chatId: string;
  chatTitle: string;
  chatType: 'private' | 'group' | 'channel';
  onClose: () => void;
}

export const CallModal = ({ chatId, chatTitle, chatType, onClose }: CallModalProps) => {
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: 'idle',
    callType: 'video',
    remoteUserId: null
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleRemoteStream = (stream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    if (callState.status === 'calling') {
      // Show local preview while waiting
      const localStream = getLocalStream();
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [callState.status]);

  const handleStartCall = async (type: 'audio' | 'video') => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    // For private chats, get the other user's ID
    // For groups, this would need additional logic
    
    const success = await startCall(
      'other-user-id', // Would need to get from chat members
      type,
      chatId,
      setCallState,
      (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
    );

    if (success && localVideoRef.current) {
      const localStream = getLocalStream();
      if (localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  };

  const handleAcceptCall = async () => {
    if (!callState.callId || !callState.remoteUserId) return;

    await acceptCall(
      callState.callId,
      callState.callType,
      callState.remoteUserId,
      setCallState,
      (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
    );

    if (localVideoRef.current) {
      const localStream = getLocalStream();
      if (localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  };

  const handleRejectCall = () => {
    if (callState.callId) {
      rejectCall(callState.callId);
    }
    setCallState({ callId: null, status: 'idle', callType: 'video', remoteUserId: null });
  };

  const handleEndCall = () => {
    endCallLocal();
    setCallState({ callId: null, status: 'idle', callType: 'video', remoteUserId: null });
    onClose();
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    toggleMute(newMuted);
  };

  const handleToggleVideo = () => {
    const newEnabled = !isVideoEnabled;
    setIsVideoEnabled(newEnabled);
    toggleVideo(!newEnabled);
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
      setIsScreenSharing(false);
    } else {
      await startScreenShare();
      setIsScreenSharing(true);
    }
  };

  if (callState.status === 'idle') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div 
          className="w-[400px] rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--sidebar-bg)' }}
        >
          <div className="p-6 text-center">
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--window-fg)' }}>
              {chatTitle}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--window-subfg)' }}>
              {chatType === 'private' ? 'Личный звонок' : 'Групповой звонок'}
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleStartCall('audio')}
                className="p-4 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                title="Аудио звонок"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              
              <button
                onClick={() => handleStartCall('video')}
                className="p-4 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                title="Видео звонок"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              <button
                onClick={onClose}
                className="p-4 rounded-full transition-colors"
                style={{ backgroundColor: '#e53935', color: 'white' }}
                title="Закрыть"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (callState.status === 'ringing') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div 
          className="w-[400px] rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--sidebar-bg)' }}
        >
          <div className="p-6 text-center">
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--window-fg)' }}>
              Входящий {callState.callType === 'video' ? 'видео' : 'аудио'}звонок
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--window-subfg)' }}>
              {chatTitle} звонит...
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAcceptCall}
                className="p-4 rounded-full transition-colors"
                style={{ backgroundColor: '#4caf50', color: 'white' }}
                title="Принять"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              
              <button
                onClick={handleRejectCall}
                className="p-4 rounded-full transition-colors"
                style={{ backgroundColor: '#e53935', color: 'white' }}
                title="Отклонить"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active call
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Remote video (full screen) */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Call info */}
        <div className="absolute top-4 left-4 text-white">
          <p className="text-lg font-semibold">{chatTitle}</p>
          <p className="text-sm opacity-80">
            {callState.status === 'calling' ? 'Идёт вызов...' : 'Звонок'}
          </p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="h-24 bg-black/80 flex items-center justify-center gap-4">
        <button
          onClick={handleToggleMute}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500' : 'bg-gray-600'}`}
          title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={handleToggleVideo}
          className={`p-4 rounded-full transition-colors ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-600'}`}
          title={isVideoEnabled ? 'Выключить камеру' : 'Включить камеру'}
        >
          {!isVideoEnabled ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={handleScreenShare}
          className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-green-500' : 'bg-gray-600'}`}
          title={isScreenSharing ? 'Остановить демонстрацию' : 'Показать экран'}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full transition-colors bg-red-500"
          title="Завершить звонок"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
