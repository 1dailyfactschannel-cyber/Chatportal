import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { useChatStore } from '../../stores/chatStore';

export const ChatView = () => {
  const { activeChat } = useChatStore();

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#ffffff] dark:bg-[#17212b]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#f5f5f5] dark:bg-[#2f3e50] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#a0a0a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[#999999] dark:text-[#708499]">Выберите чат чтобы начать общение</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#ffffff] dark:bg-[#17212b]">
      <ChatHeader chat={activeChat} />
      <MessageList />
      <MessageInput />
    </div>
  );
};
