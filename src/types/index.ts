export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  type: 'private' | 'group' | 'channel';
  title: string;
  avatarUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  members: number;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'file';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
