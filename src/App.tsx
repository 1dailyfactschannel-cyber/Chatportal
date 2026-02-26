import { useEffect, useState } from 'react';
import { ChatList } from './components/Sidebar/ChatList';
import { ChatView } from './components/Chat/ChatView';
import { LoginScreen } from './components/LoginScreen';
import { useAuthStore } from './stores/authStore';
import { useChatStore } from './stores/chatStore';
import { connectWebSocket } from './services/websocket';
import type { Chat } from './types';

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { setChats, chats } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
      
      const demoChats: Chat[] = [
        {
          id: '1',
          type: 'private',
          title: 'Иван Иванов',
          avatarUrl: undefined,
          lastMessage: {
            id: 'm1',
            chatId: '1',
            senderId: '1',
            content: 'Привет! Как дела?',
            contentType: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            status: 'read',
          },
          unreadCount: 2,
          members: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'group',
          title: 'Команда разработки',
          lastMessage: {
            id: 'm2',
            chatId: '2',
            senderId: '3',
            content: 'Сегодня созвон в 15:00',
            contentType: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'read',
          },
          unreadCount: 5,
          members: 8,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'private',
          title: 'Мария Петрова',
          lastMessage: {
            id: 'm3',
            chatId: '3',
            senderId: 'me',
            content: 'Отправила документы',
            contentType: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: 'delivered',
          },
          unreadCount: 0,
          members: 2,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          type: 'channel',
          title: 'Новости технологий',
          lastMessage: {
            id: 'm4',
            chatId: '4',
            senderId: 'system',
            content: 'Новая версия Rust уже доступна',
            contentType: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            status: 'read',
          },
          unreadCount: 12,
          members: 1250,
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          type: 'group',
          title: 'Друзья',
          lastMessage: {
            id: 'm5',
            chatId: '5',
            senderId: '4',
            content: 'Встречаемся в субботу?',
            contentType: 'text',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: 'read',
          },
          unreadCount: 0,
          members: 6,
          createdAt: new Date().toISOString(),
        },
      ];
      
      setChats(demoChats);
    }
  }, [isAuthenticated, setChats]);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (searchQuery) {
      useChatStore.setState({ chats: filteredChats });
    }
  }, [searchQuery, filteredChats]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--chat-bg)' }}>
      {/* Sidebar - как в Telegram */}
      <div 
        className="w-[325px] flex flex-col"
        style={{ 
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)'
        }}
      >
        {/* Header */}
        <div 
          className="h-[60px] flex items-center justify-between px-4"
          style={{ borderBottom: '1px solid var(--header-border)' }}
        >
          <div className="flex items-center gap-3">
            {user && (
              <div 
                className="avatar avatar-md"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
              title="Выйти"
              style={{ color: 'var(--window-subfg)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              style={{ color: 'var(--window-subfg)' }}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="px-4 py-2">
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg text-[14px] outline-none"
            style={{ 
              backgroundColor: 'var(--compose-input-bg)',
              color: 'var(--window-fg)'
            }}
          />
        </div>
        
        {/* Chat List */}
        <ChatList />
      </div>
      
      {/* Chat */}
      <ChatView />
    </div>
  );
}

export default App;
