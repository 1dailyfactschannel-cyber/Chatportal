import { useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Message } from './Message';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';

const ITEM_HEIGHT = 60;

export const MessageList = () => {
  const { activeChat, messages } = useChatStore();
  const { user } = useAuthStore();
  const listRef = useRef<any>(null);
  
  const chatMessages = activeChat ? messages[activeChat.id] || [] : [];

  useEffect(() => {
    if (listRef.current && chatMessages.length > 0) {
      listRef.current.scrollToItem(chatMessages.length - 1);
    }
  }, [chatMessages.length, activeChat?.id]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = chatMessages[index];
    const isOutgoing = message.senderId === user?.id;
    
    return (
      <div style={style}>
        <Message message={message} isOutgoing={isOutgoing} />
      </div>
    );
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Выберите чат
      </div>
    );
  }

  if (chatMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#999999] dark:text-[#708499]">
        Нет сообщений. Напишите первым!
      </div>
    );
  }

  return (
    <List
      ref={listRef}
      height={window.innerHeight - 180}
      itemCount={chatMessages.length}
      itemSize={ITEM_HEIGHT}
      width="100%"
      className="px-4"
    >
      {Row}
    </List>
  );
};
