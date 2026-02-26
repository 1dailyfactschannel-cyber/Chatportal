import { ChatItem } from './ChatItem';
import { useChatStore } from '../../stores/chatStore';

export const ChatList = () => {
  const { chats, activeChat, setActiveChat } = useChatStore();

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Нет чатов
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={activeChat?.id === chat.id}
          onClick={() => setActiveChat(chat)}
        />
      ))}
    </div>
  );
};
