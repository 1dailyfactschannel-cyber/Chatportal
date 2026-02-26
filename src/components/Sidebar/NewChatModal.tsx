import { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { chatApi, api } from '../../services/api';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { setChats, chats } = useChatStore();

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/search?q=${searchQuery}`);
      setUsers(data);
    } catch (err) {
      console.error('Failed to search users:', err);
    }
    setLoading(false);
  };

  const createChat = async (userId: string) => {
    setCreating(true);
    try {
      const { data: newChat } = await chatApi.createChat('private', '', [userId]);
      setChats([newChat, ...chats]);
      onClose();
      setSearchQuery('');
      setUsers([]);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
    setCreating(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-h-[500px] rounded-xl z-50 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        <div 
          className="h-[60px] flex items-center px-4"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors mr-2"
            style={{ color: 'var(--window-fg)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-lg" style={{ color: 'var(--window-fg)' }}>
            Новый чат
          </span>
        </div>

        <div className="p-3">
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-[14px] outline-none"
            style={{ 
              backgroundColor: 'var(--compose-input-bg)',
              color: 'var(--window-fg)'
            }}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
            </div>
          )}

          {!loading && users.length === 0 && searchQuery.length >= 2 && (
            <div className="text-center py-4" style={{ color: 'var(--window-subfg)' }}>
              Пользователи не найдены
            </div>
          )}

          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => createChat(user.id)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            >
              <div 
                className="avatar avatar-md"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold" style={{ color: 'var(--dialogs-name)' }}>
                  {user.displayName}
                </div>
                <div className="text-sm" style={{ color: 'var(--dialogs-message)' }}>
                  @{user.username}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
