import { Avatar } from '../common/Avatar';
import type { Chat } from '../../types';

interface ChatHeaderProps {
  chat: Chat;
}

export const ChatHeader = ({ chat }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e0e0e0] dark:border-[#2f3e50]">
      <Avatar name={chat.title} imageUrl={chat.avatarUrl} size="md" />
      <div>
        <h2 className="font-semibold text-[#000000] dark:text-[#ffffff]">{chat.title}</h2>
        <span className="text-[12px] text-[#999999] dark:text-[#708499]">
          {chat.type === 'group' ? `${chat.members} участников` : 'онлайн'}
        </span>
      </div>
    </div>
  );
};
