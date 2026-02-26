import { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { chatApi, api } from '../../services/api';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

type ChatType = 'private' | 'group' | 'channel';

export const CreateChatModal = ({ isOpen, onClose }: CreateChatModalProps) => {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [chatType, setChatType] = useState<ChatType>('private');
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { setChats, chats } = useChatStore();

  useEffect(() => {
    if (searchQuery.length >= 2 && chatType !== 'private') {
      searchUsers();
    } else if (searchQuery.length === 0) {
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

  const toggleUser = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (chatType === 'private' && selectedUsers.length === 0) return;
    if ((chatType === 'group' || chatType === 'channel') && !title.trim()) return;

    setCreating(true);
    try {
      const members = selectedUsers.map(u => u.id);
      const { data: newChat } = await chatApi.createChat(chatType, title, members);
      setChats([newChat, ...chats]);
      onClose();
      resetForm();
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
    setCreating(false);
  };

  const resetForm = () => {
    setStep('type');
    setChatType('private');
    setTitle('');
    setSearchQuery('');
    setUsers([]);
    setSelectedUsers([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={handleClose} />
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-h-[500px] rounded-xl z-50 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        <div 
          className="h-[60px] flex items-center px-4"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <button
            onClick={step === 'details' ? () => setStep('type') : handleClose}
            className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors mr-2"
            style={{ color: 'var(--window-fg)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-lg" style={{ color: 'var(--window-fg)' }}>
            {step === 'type' ? 'Создать' : chatType === 'private' ? 'Новый пользователь' : chatType === 'group' ? 'Новая группа' : 'Новый канал'}
          </span>
        </div>

        {step === 'type' ? (
          <div className="p-4 space-y-3">
            <button
              onClick={() => {
                setChatType('private');
                setStep('details');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold" style={{ color: 'var(--window-fg)' }}>Личный чат</div>
                <div className="text-sm" style={{ color: 'var(--window-subfg)' }}>Общение с одним человеком</div>
              </div>
            </button>

            <button
              onClick={() => {
                setChatType('group');
                setStep('details');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold" style={{ color: 'var(--window-fg)' }}>Группа</div>
                <div className="text-sm" style={{ color: 'var(--window-subfg)' }}>Общение с несколькими людьми</div>
              </div>
            </button>

            <button
              onClick={() => {
                setChatType('channel');
                setStep('details');
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold" style={{ color: 'var(--window-fg)' }}>Канал</div>
                <div className="text-sm" style={{ color: 'var(--window-subfg)' }}>Публичная трансляция сообщений</div>
              </div>
            </button>
          </div>
        ) : (
          <>
            {(chatType === 'group' || chatType === 'channel') && (
              <div className="p-4">
                <input
                  type="text"
                  placeholder={chatType === 'channel' ? 'Название канала' : 'Название группы'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-[14px] outline-none"
                  style={{ 
                    backgroundColor: 'var(--compose-input-bg)',
                    color: 'var(--window-fg)'
                  }}
                  autoFocus
                />
              </div>
            )}

            <div className="px-4 pb-2">
              <input
                type="text"
                placeholder="Поиск участников..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-[14px] outline-none"
                style={{ 
                  backgroundColor: 'var(--compose-input-bg)',
                  color: 'var(--window-fg)'
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[200px]">
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
                  onClick={() => chatType === 'private' ? toggleUser(user) : toggleUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--dialogs-bg-hover)] transition-colors"
                >
                  {chatType !== 'private' && (
                    <input 
                      type="checkbox" 
                      checked={!!selectedUsers.find(u => u.id === user.id)}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                  )}
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
                  {chatType === 'private' && selectedUsers.find(u => u.id === user.id) && (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div 
              className="p-4 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--sidebar-border)' }}
            >
              <div style={{ color: 'var(--window-subfg)' }}>
                {selectedUsers.length > 0 && `${selectedUsers.length} выбрано`}
              </div>
              <button
                onClick={handleCreate}
                disabled={
                  creating || 
                  (chatType === 'private' && selectedUsers.length === 0) ||
                  ((chatType === 'group' || chatType === 'channel') && !title.trim())
                }
                className="px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'white'
                }}
              >
                {creating ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
