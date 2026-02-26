import { FixedSizeList as List } from 'react-window';
import { ChatItem } from './ChatItem';
import { useChatStore } from '../../stores/chatStore';

const ITEM_HEIGHT = 76;

export const ChatList = () => {
  const { chats, activeChat, setActiveChat } = useChatStore();

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const chat = chats[index];
    return (
      <div style={style}>
        <ChatItem
          chat={chat}
          isActive={activeChat?.id === chat.id}
          onClick={() => setActiveChat(chat)}
        />
      </div>
    );
  };

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Нет чатов
      </div>
    );
  }

  return (
    <List
      height={window.innerHeight - 120}
      itemCount={chats.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
    >
      {Row}
    </List>
  );
};
