import { useEffect, useState } from 'react';
import { ChatList } from './components/Sidebar/ChatList';
import { ChatFolders, ChatFolder } from './components/Sidebar/ChatFolders';
import { SidebarMenu } from './components/Sidebar/SidebarMenu';
import { ChatView } from './components/Chat/ChatView';
import { LoginScreen } from './components/LoginScreen';
import { useAuthStore } from './stores/authStore';
import { useChatStore } from './stores/chatStore';
import { connectWebSocket, disconnectWebSocket } from './services/websocket';
import { chatApi } from './services/api';
import type { Chat } from './types';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { setChats, setMessages, chats } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState<ChatFolder>('all');

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
      
      chatApi.getChats()
        .then((data) => {
          setChats(data);
        })
        .catch((err) => {
          console.error('Failed to load chats:', err);
        });
    } else {
      disconnectWebSocket();
    }
  }, [isAuthenticated, setChats]);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeFolder) {
      case 'personal':
        return chat.type === 'private';
      case 'groups':
        return chat.type === 'group';
      case 'channels':
        return chat.type === 'channel';
      case 'unread':
        return chat.unreadCount > 0;
      default:
        return true;
    }
  });

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--chat-bg)' }}>
      <SidebarMenu isOpen={sidebarMenuOpen} onClose={() => setSidebarMenuOpen(false)} />
      
      <div 
        className="flex"
        style={{ 
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)'
        }}
      >
        <ChatFolders 
          activeFolder={activeFolder} 
          onFolderChange={setActiveFolder} 
        />
        
        <div 
          className="w-[280px] flex flex-col"
          style={{ borderRight: '1px solid var(--sidebar-border)' }}
        >
          <div 
            className="h-[60px] flex items-center justify-between px-3"
            style={{ borderBottom: '1px solid var(--header-border)' }}
          >
            <button
              onClick={() => setSidebarMenuOpen(true)}
              className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
              style={{ color: 'var(--window-fg)' }}
              title="Меню"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
          
          <div className="px-3 py-2">
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--compose-input-bg)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--compose-icon)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: 'var(--window-fg)' }}
              />
            </div>
          </div>
          
          <ChatList chats={filteredChats} />
        </div>
      </div>
      
      <ChatView />
    </div>
  );
}

export default App;
