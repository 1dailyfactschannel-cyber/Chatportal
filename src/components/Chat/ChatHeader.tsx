import { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { CallModal } from './CallModal';
import type { Chat } from '../../types';

interface ChatHeaderProps {
  chat: Chat;
}

export const ChatHeader = ({ chat }: ChatHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const getStatusText = () => {
    if (chat.type === 'group') {
      return `${chat.members} участников`;
    }
    if (chat.type === 'channel') {
      return `${chat.members} подписчиков`;
    }
    return 'был(а) в сети недавно';
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
    <>
      <div 
        className="flex items-center gap-3 px-4 py-3 relative"
        style={{ 
          borderBottom: '1px solid var(--header-border)',
          backgroundColor: 'var(--header-bg)'
        }}
      >
        <Avatar name={chat.title} imageUrl={chat.avatarUrl} size="md" />
        
        <div className="flex-1 cursor-pointer">
          <div className="flex items-center gap-1">
            <h2 className="font-semibold" style={{ color: 'var(--window-fg)' }}>
              {chat.title}
            </h2>
            {chat.type !== 'private' && (
              <span style={{ color: 'var(--window-subfg)' }}>
                {getChatIcon()}
              </span>
            )}
          </div>
          <span className="text-[12px]" style={{ color: 'var(--window-subfg)' }}>
            {getStatusText()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCallModalOpen(true)}
            className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            style={{ color: 'var(--compose-icon)' }}
            title="Звонок"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            style={{ color: 'var(--compose-icon)' }}
            title="Поиск"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
              style={{ color: 'var(--compose-icon)' }}
              title="Ещё"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div 
                  className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg z-50 py-1"
                  style={{ 
                    backgroundColor: 'var(--sidebar-bg)',
                    border: '1px solid var(--sidebar-border)'
                  }}
                >
                  {[
                    { icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', label: 'Профиль' },
                    { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Настройки' },
                    { icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', label: 'Выйти' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--dialogs-bg-hover)] transition-colors"
                      style={{ color: 'var(--window-fg)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="text-[14px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {callModalOpen && (
        <CallModal 
          chatId={chat.id}
          chatTitle={chat.title}
          chatType={chat.type}
          onClose={() => setCallModalOpen(false)}
        />
      )}
    </>
  );
};
