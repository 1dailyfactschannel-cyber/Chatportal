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

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[#e8e8e8] dark:border-[#233242]',
        isActive ? 'bg-[#f0f0f0] dark:bg-[#1e2a38]' : 'hover:bg-[#f5f5f5] dark:hover:bg-[#1e2a38]'
      )}
    >
      <Avatar
        name={chat.title}
        imageUrl={chat.avatarUrl}
        size="lg"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={clsx(
            'font-semibold text-sm truncate',
            isActive ? 'text-[#000000] dark:text-[#ffffff]' : 'text-[#000000] dark:text-[#ffffff]'
          )}>
            {chat.title}
          </span>
          <span className="text-[11px] text-[#8e8e8e] dark:text-[#5e6c7e] flex-shrink-0 ml-2">
            {formatTime(chat.lastMessage?.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[13px] text-[#999999] dark:text-[#708499] truncate">
            {chat.lastMessage?.content || 'Нет сообщений'}
          </span>
          
          {chat.unreadCount > 0 && (
            <span className={clsx(
              'min-w-[20px] h-5 px-1.5 rounded-[10px] flex items-center justify-center text-[12px] font-medium text-white ml-2',
              chat.unreadCount > 0 ? 'bg-[#6ab3f3]' : 'bg-[#d7d7d7]'
            )}>
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
