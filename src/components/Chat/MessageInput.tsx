import { useState, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { sendMessage, sendTyping } from '../../services/websocket';
import { chatApi } from '../../services/api';

export const MessageInput = () => {
  const [text, setText] = useState('');
  const { activeChat, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatId: activeChat.id,
      senderId: user?.id || 'me',
      content: text,
      contentType: 'text' as const,
      timestamp: new Date().toISOString(),
      status: 'sending' as const,
    };
    
    addMessage(activeChat.id, tempMessage);
    sendMessage(activeChat.id, text);
    
    try {
      await chatApi.sendMessage(activeChat.id, text);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    
    setText('');
    if (activeChat) {
      sendTyping(activeChat.id, false);
    }
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
    
    if (activeChat) {
      sendTyping(activeChat.id, true);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        sendTyping(activeChat.id, false);
      }, 2000);
    }
  };

  return (
    <div 
      className="flex items-end gap-2 px-4 pb-4"
      style={{ 
        backgroundColor: 'transparent',
      }}
    >
      <button 
        className="p-2 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
        style={{ color: 'var(--compose-icon)' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      
      <div 
        className="flex-1 flex items-end rounded-full px-4 py-2"
        style={{ 
          backgroundColor: 'var(--compose-input-bg)',
          border: '1px solid var(--compose-border)'
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение..."
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-[14px]"
          style={{ 
            color: 'var(--window-fg)',
            maxHeight: '120px'
          }}
        />
      </div>
      
      <button 
        className="p-2 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
        style={{ color: 'var(--compose-icon)' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {text.trim() ? (
        <button
          onClick={handleSend}
          className="p-3 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ 
            backgroundColor: 'var(--accent)',
            color: 'white'
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      ) : (
        <button 
          className="p-2 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
          style={{ color: 'var(--compose-icon)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
    </div>
  );
};
