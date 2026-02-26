import { useState, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { sendMessage, sendTyping } from '../../services/websocket';

export const MessageInput = () => {
  const [text, setText] = useState('');
  const { activeChat, addMessage } = useChatStore();
  const typingTimeout = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || !activeChat) return;
    
    // Добавляем сообщение локально сразу (optimistic update)
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
    
    // Отправляем на сервер
    sendMessage(activeChat.id, text);
    
    setText('');
    sendTyping(activeChat.id, false);
    
    // Сбрасываем высоту textarea
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
    
    // Автоматическая высота textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
    
    if (activeChat) {
      sendTyping(activeChat.id, true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        sendTyping(activeChat.id, false);
      }, 2000);
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-[#ffffff] dark:bg-[#232e3c] border-t border-[#e0e0e0] dark:border-[#2f3e50]">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Написать сообщение..."
        rows={1}
        className="flex-1 px-3 py-2 bg-[#f5f5f5] dark:bg-[#2f3e50] rounded-lg resize-none text-[14px] text-[#000000] dark:text-[#ffffff] placeholder-[#a0a0a0] outline-none focus:ring-1 focus:ring-[#0088cc] min-h-[40px] max-h-[120px]"
      />
      
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="p-2.5 rounded-full bg-[#0088cc] hover:bg-[#006699] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
};
