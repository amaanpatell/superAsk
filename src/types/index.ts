import { MessageRole, MessageType } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  messageRole: MessageRole;
  messageType: MessageType;
  content: string;
  model?: string | null;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  userId: string;
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSidebarProps {
  user: User;
  chats: Chat[];
}

export interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  older: Chat[];
}
