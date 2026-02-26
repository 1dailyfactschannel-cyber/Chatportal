import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { useChatStore } from '../../stores/chatStore';

export const ChatView = () => {
  const { activeChat } = useChatStore();

  if (!activeChat) {
    return (
      <div 
        className="flex-1 flex items-center justify-center"
        style={{ 
          backgroundColor: 'var(--chat-bg)',
          backgroundImage: 'var(--chat-bg-pattern)',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="text-center">
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--compose-input-bg)' }}
          >
            <svg 
              className="w-10 h-10" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ color: 'var(--compose-icon)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p style={{ color: 'var(--window-subfg)' }}>
            Выберите чат чтобы начать общение
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col"
      style={{ 
        backgroundColor: 'var(--chat-bg)',
        backgroundImage: 'var(--chat-bg-pattern)',
        backgroundRepeat: 'repeat'
      }}
    >
      <ChatHeader chat={activeChat} />
      <MessageList />
      <MessageInput />
    </div>
  );
};
