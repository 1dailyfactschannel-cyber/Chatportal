import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;
let screenStream: MediaStream | null = null;

let onCallStateChange: ((state: CallState) => void) | null = null;
let onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;

export interface CallState {
  callId: string | null;
  status: 'idle' | 'calling' | 'ringing' | 'accepted' | 'ended' | 'rejected';
  callType: 'audio' | 'video';
  remoteUserId: string | null;
}

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const connectWebSocket = () => {
  const token = useAuthStore.getState().token;
  if (!token) return;

  if (ws?.readyState === WebSocket.OPEN) return;

  const wsUrl = `${WS_URL}/ws?token=${token}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            useChatStore.getState().addMessage(data.chatId, data.message);
            break;
          case 'typing':
            const user = useAuthStore.getState().user;
            if (user && data.userId !== user.id) {
              useChatStore.getState().setTyping(data.chatId, data.userId, data.username || 'User', data.isTyping);
            }
            break;
          case 'new_chat':
            const chats = useChatStore.getState().chats;
            useChatStore.setState({ chats: [data.chat, ...chats] });
            break;
          case 'call':
            handleCallSignal(data);
            break;
          case 'call-rejected':
            if (onCallStateChange) {
              onCallStateChange({
                callId: data.callId,
                status: 'rejected',
                callType: 'video',
                remoteUserId: null
              });
            }
            endCall();
            break;
          case 'call-ended':
            if (onCallStateChange) {
              onCallStateChange({
                callId: data.callId,
                status: 'ended',
                callType: 'video',
                remoteUserId: null
              });
            }
            endCall();
            break;
          case 'ice-candidate':
            handleIceCandidate(data);
            break;
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      reconnectTimeout = setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    reconnectTimeout = setTimeout(connectWebSocket, 3000);
  }
};

async function handleCallSignal(data: any) {
  if (data.status === 'ringing' && onCallStateChange) {
    onCallStateChange({
      callId: data.callId,
      status: 'ringing',
      callType: data.callType,
      remoteUserId: data.callerId
    });
  } else if (data.status === 'accepted') {
    if (onCallStateChange) {
      onCallStateChange({
        callId: data.callId,
        status: 'accepted',
        callType: data.callType,
        remoteUserId: null
      });
    }
    if (data.answer) {
      await peerConnection?.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  } else if (data.status === 'calling') {
    if (onCallStateChange) {
      onCallStateChange({
        callId: data.callId,
        status: 'calling',
        callType: data.callType,
        remoteUserId: null
      });
    }
  }
}

async function handleIceCandidate(data: any) {
  if (peerConnection && data.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (e) {
      console.error('Error adding ICE candidate:', e);
    }
  }
}

export const disconnectWebSocket = () => {
  endCall();
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
};

export const sendMessage = (chatId: string, content: string) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'message', chatId, content }));
  }
};

export const sendTyping = (chatId: string, isTyping: boolean) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'typing', chatId, isTyping }));
  }
};

export const startCall = async (
  calleeId: string,
  callType: 'audio' | 'video',
  chatId: string,
  onStateChange: (state: CallState) => void,
  onRemoteStreamCallbackFn: (stream: MediaStream) => void
): Promise<boolean> => {
  onCallStateChange = onStateChange;
  onRemoteStreamCallback = onRemoteStreamCallbackFn;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true
    });

    peerConnection = new RTCPeerConnection(iceServers);

    localStream.getTracks().forEach(track => {
      peerConnection!.addTrack(track, localStream!);
    });

    remoteStream = new MediaStream();
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream!.addTrack(track);
      });
      if (onRemoteStreamCallback) {
        onRemoteStreamCallback(remoteStream);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: calleeId
        }));
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'call',
        chatId,
        calleeId,
        callType
      }));
    }

    if (onStateChange) {
      onStateChange({
        callId: chatId,
        status: 'calling',
        callType,
        remoteUserId: calleeId
      });
    }

    return true;
  } catch (error) {
    console.error('Error starting call:', error);
    return false;
  }
};

export const acceptCall = async (
  callId: string,
  callType: 'audio' | 'video',
  callerId: string,
  onStateChange: (state: CallState) => void,
  onRemoteStreamCallbackFn: (stream: MediaStream) => void
): Promise<boolean> => {
  onCallStateChange = onStateChange;
  onRemoteStreamCallback = onRemoteStreamCallbackFn;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true
    });

    peerConnection = new RTCPeerConnection(iceServers);

    localStream.getTracks().forEach(track => {
      peerConnection!.addTrack(track, localStream!);
    });

    remoteStream = new MediaStream();
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream!.addTrack(track);
      });
      if (onRemoteStreamCallback) {
        onRemoteStreamCallback(remoteStream);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetUserId: callerId
        }));
      }
    };

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'call-answer',
        callId,
        accepted: true,
        answer: peerConnection.localDescription
      }));
    }

    if (onStateChange) {
      onStateChange({
        callId,
        status: 'accepted',
        callType,
        remoteUserId: callerId
      });
    }

    return true;
  } catch (error) {
    console.error('Error accepting call:', error);
    return false;
  }
};

export const rejectCall = (callId: string) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'call-reject',
      callId
    }));
  }
  endCall();
};

export const endCallLocal = () => {
  if (ws?.readyState === WebSocket.OPEN) {
    const callState = onCallStateChange?.({ callId: '', status: 'idle', callType: 'video', remoteUserId: null });
    ws.send(JSON.stringify({
      type: 'call-end',
      callId: 'current'
    }));
  }
  endCall();
};

function endCall() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
    screenStream = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  remoteStream = null;
  onCallStateChange = null;
  onRemoteStreamCallback = null;
}

export const toggleMute = (muted: boolean) => {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });
  }
};

export const toggleVideo = (enabled: boolean) => {
  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }
};

export const startScreenShare = async (): Promise<MediaStream | null> => {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    if (peerConnection && localStream) {
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      videoTrack.onended = () => {
        stopScreenShare();
      };
    }

    return screenStream;
  } catch (error) {
    console.error('Error starting screen share:', error);
    return null;
  }
};

export const stopScreenShare = async () => {
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
    screenStream = null;
  }

  if (peerConnection && localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
    
    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack);
    }
  }
};

export const getLocalStream = (): MediaStream | null => localStream;
export const getRemoteStream = (): MediaStream | null => remoteStream;
