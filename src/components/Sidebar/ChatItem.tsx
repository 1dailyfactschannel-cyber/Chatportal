import clsx from 'clsx';
import type { Chat } from '../../types';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatItem = ({ chat, isActive, onClick }: ChatItemProps) => {
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const getChatIcon = () => {
    if (chat.type === 'group') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      );
    }
    if (chat.type === 'channel') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    }
    return null;
  };

  const getLastMessagePreview = () => {
    if (!chat.lastMessage?.content) return 'Нет сообщений';
    const content = chat.lastMessage.content;
    return content.length > 40 ? content.substring(0, 40) + '...' : content;
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'chat-item flex items-center gap-3 px-3 relative cursor-pointer',
        isActive && 'active'
      )}
      style={{ 
        backgroundColor: isActive ? 'var(--dialogs-bg-active)' : 'transparent',
      }}
    >
      {isActive && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}
      
      <div className="relative">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {chat.title.slice(0, 2).toUpperCase()}
        </div>
        {chat.type === 'private' && (
          <div 
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
            style={{ 
              backgroundColor: 'var(--online)',
              borderColor: 'var(--sidebar-bg)'
            }}
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span 
              className="font-semibold text-sm truncate"
              style={{ color: 'var(--dialogs-name)' }}
            >
              {chat.title}
            </span>
            {chat.type !== 'private' && (
              <span className="ml-1" style={{ color: 'var(--window-subfg)' }}>
                {getChatIcon()}
              </span>
            )}
          </div>
          <span 
            className="text-[11px] flex-shrink-0 ml-2"
            style={{ color: 'var(--dialogs-date)' }}
          >
            {formatTime(chat.lastMessage?.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-0.5">
          <span 
            className="text-[13px] truncate"
            style={{ color: 'var(--dialogs-message)' }}
          >
            {getLastMessagePreview()}
          </span>
          
          {chat.unreadCount > 0 && (
            <span 
              className="unread-badge ml-2 flex-shrink-0"
              style={{ 
                backgroundColor: 'var(--dialogs-unread)',
                color: 'var(--dialogs-unread-text)'
              }}
            >
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
