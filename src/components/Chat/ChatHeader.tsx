import { Avatar } from '../common/Avatar';
import type { Chat } from '../../types';

interface ChatHeaderProps {
  chat: Chat;
}

export const ChatHeader = ({ chat }: ChatHeaderProps) => {
  const getStatusText = () => {
    if (chat.type === 'group') {
      return `${chat.members} участников`;
    }
    return 'был(а) в сети недавно';
  };

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3"
      style={{ 
        borderBottom: '1px solid var(--header-border)',
        backgroundColor: 'var(--header-bg)'
      }}
    >
      <Avatar name={chat.title} imageUrl={chat.avatarUrl} size="md" />
      
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <h2 className="font-semibold" style={{ color: 'var(--window-fg)' }}>
            {chat.title}
          </h2>
        </div>
        <span className="text-[12px]" style={{ color: 'var(--window-subfg)' }}>
          {getStatusText()}
        </span>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-1">
        <button 
          className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
          style={{ color: 'var(--compose-icon)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button 
          className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
          style={{ color: 'var(--compose-icon)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
