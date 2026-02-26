import { useEffect, useRef } from 'react';
import { MessageBubble } from './Message';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { chatApi } from '../../services/api';

export const MessageList = () => {
  const { activeChat, messages, setMessages } = useChatStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatMessages = activeChat ? messages[activeChat.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, activeChat?.id]);

  useEffect(() => {
    if (activeChat && (!messages[activeChat.id] || messages[activeChat.id].length === 0)) {
      chatApi.getMessages(activeChat.id)
        .then((data) => {
          setMessages(activeChat.id, data);
        })
        .catch((err) => {
          console.error('Failed to load messages:', err);
        });
    }
  }, [activeChat?.id, messages, setMessages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Выберите чат
      </div>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Нет сообщений. Напишите первым!
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
      <div ref={messagesEndRef} />
    </div>
  );
};
