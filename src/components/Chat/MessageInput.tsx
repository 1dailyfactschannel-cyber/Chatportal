import { useState, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { sendMessage, sendTyping } from '../../services/websocket';

export const MessageInput = () => {
  const [text, setText] = useState('');
  const { activeChat, addMessage } = useChatStore();
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || !activeChat) return;
    
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chatId: activeChat.id,
      senderId: 'me',
      content: text,
      contentType: 'text' as const,
      timestamp: new Date().toISOString(),
      status: 'sending' as const,
    };
    
    addMessage(activeChat.id, tempMessage);
    sendMessage(activeChat.id, text);
    
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
      className="flex items-end gap-2 p-3"
      style={{ 
        backgroundColor: 'var(--compose-bg)',
        borderTop: '1px solid var(--compose-border)'
      }}
    >
      {/* Attach button */}
      <button 
        className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors flex-shrink-0"
        style={{ color: 'var(--compose-icon)' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Написать сообщение..."
        rows={1}
        className="telegram-input flex-1 resize-none min-h-[40px] max-h-[120px]"
      />
      
      {/* Emoji button */}
      <button 
        className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors flex-shrink-0"
        style={{ color: 'var(--compose-icon)' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="send-button"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
};
