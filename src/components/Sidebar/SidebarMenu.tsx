import { useAuthStore } from '../../stores/authStore';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarMenu = ({ isOpen, onClose }: SidebarMenuProps) => {
  const { user, logout } = useAuthStore();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      
      <div 
        className="fixed left-0 top-0 bottom-0 w-[280px] z-50 flex flex-col animate-slide-in"
        style={{ 
          backgroundColor: 'var(--sidebar-bg)',
        }}
      >
        <div 
          className="h-[60px] flex items-center px-4"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--dialogs-bg-hover)] transition-colors"
            style={{ color: 'var(--window-fg)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div 
            className="avatar avatar-lg"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {user?.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold" style={{ color: 'var(--dialogs-name)' }}>
              {user?.displayName}
            </div>
            <div className="text-sm" style={{ color: 'var(--dialogs-message)' }}>
              @{user?.username}
            </div>
          </div>
        </div>

        <div className="flex-1 py-2">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              label: 'Настройки',
              onClick: () => {},
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              label: 'Контакты',
              onClick: () => {},
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              ),
              label: 'Выйти',
              onClick: logout,
              danger: true,
            },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--dialogs-bg-hover)] transition-colors"
              style={{ color: item.danger ? '#e53935' : 'var(--window-fg)' }}
            >
              {item.icon}
              <span className="text-[15px]">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 text-center text-xs" style={{ color: 'var(--dialogs-message)' }}>
          Chatportal v1.0.0
        </div>
      </div>
    </>
  );
};
