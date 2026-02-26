import { useEffect, useRef } from 'react';
import { MessageBubble } from './Message';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { chatApi } from '../../services/api';

export const MessageList = () => {
  const { activeChat, messages, setMessages, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedRead = useRef(false);
  
  const chatMessages = activeChat ? messages[activeChat.id] || [] : [];
  const isTyping = activeChat ? typingUsers[activeChat.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, activeChat?.id]);

  // Mark messages as read when viewing a chat
  useEffect(() => {
    if (activeChat && !hasMarkedRead.current) {
      chatApi.markAsRead(activeChat.id)
        .then(() => {
          hasMarkedRead.current = true;
        })
        .catch((err) => {
          console.error('Failed to mark as read:', err);
        });
    }
  }, [activeChat?.id]);

  useEffect(() => {
    if (activeChat && (!messages[activeChat.id] || messages[activeChat.id].length === 0)) {
      chatApi.getMessages(activeChat.id)
        .then((data) => {
          setMessages(activeChat.id, data);
          hasMarkedRead.current = false;
        })
        .catch((err) => {
          console.error('Failed to load messages:', err);
        });
    }
  }, [activeChat?.id, messages, setMessages]);

  const formatTypingUsers = () => {
    if (isTyping.length === 0) return null;
    if (isTyping.length === 1) {
      return `${isTyping[0]} печатает...`;
    }
    if (isTyping.length === 2) {
      return `${isTyping[0]} и ${isTyping[1]} печатают...`;
    }
    return `${isTyping.length} человек печатают...`;
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Выберите чат
      </div>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
          Нет сообщений. Напишите первым!
        </div>
        {isTyping.length > 0 && (
          <div className="px-4 pb-2 text-sm" style={{ color: 'var(--window-subfg)' }}>
            {formatTypingUsers()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {chatMessages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isOutgoing={message.senderId === user?.id} 
        />
      ))}
      
      {isTyping.length > 0 && (
        <div className="text-sm py-1" style={{ color: 'var(--window-subfg)' }}>
          {formatTypingUsers()}
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
