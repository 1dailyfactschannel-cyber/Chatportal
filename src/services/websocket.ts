import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

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

export const disconnectWebSocket = () => {
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
