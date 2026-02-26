import { create } from 'zustand';
import type { Chat, Message } from '../types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  setTyping: (chatId: string, userId: string, username: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  setTyping: (chatId, userId, username, isTyping) =>
    set((state) => {
      const currentTyping = state.typingUsers[chatId] || [];
      if (isTyping) {
        if (currentTyping.includes(username)) return state;
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: [...currentTyping, username],
          },
        };
      } else {
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: currentTyping.filter(u => u !== username),
          },
        };
      }
    }),
}));
