import { Avatar } from '../common/Avatar';
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

  return (
    <div
      onClick={onClick}
      className={clsx(
        'chat-item flex items-center gap-3',
        isActive && 'active'
      )}
      style={{ 
        backgroundColor: isActive ? 'var(--dialogs-bg-active)' : 'transparent',
        borderBottom: '1px solid var(--sidebar-border)'
      }}
    >
      <Avatar
        name={chat.title}
        imageUrl={chat.avatarUrl}
        size="lg"
      />
      
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
            {chat.lastMessage?.content || 'Нет сообщений'}
          </span>
          
          {chat.unreadCount > 0 && (
            <span 
              className="unread-badge ml-2"
              style={{ 
                backgroundColor: 'var(--dialogs-unread)',
                color: 'var(--dialogs-unread-text)'
              }}
            >
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
