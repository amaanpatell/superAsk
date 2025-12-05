import { create } from "zustand";

type Chat = {
  id: string;
  title: string;
  createdAt: string;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
};

type ChatStore = {
  activeChatId: string | null;
  chats: Chat[];
  messages: Message[];
  triggeredChats: Set<string>;
  setActiveChatId: (chatId: string | null) => void;
  setChats: (chats: Chat[]) => void;
  setMessages: (messages: Message[]) => void;
  addChat: (chat: Chat) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  markChatAsTriggered: (chatId: string) => void;
  hasChatBeenTriggered: (chatId: string) => boolean;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: [],
  triggeredChats: new Set(),

  setChats: (chats: Chat[]) => set({ chats }),
  setActiveChatId: (chatId: string | null) => set({ activeChatId: chatId }),
  setMessages: (messages: Message[]) => set({ messages }),

  addChat: (chat: Chat) => set({ chats: [chat, ...get().chats] }),
  addMessage: (message: Message) =>
    set({ messages: [...get().messages, message] }),
  clearMessages: () => set({ messages: [] }),

  markChatAsTriggered: (chatId: string) => {
    const triggered = new Set(get().triggeredChats);
    triggered.add(chatId);
    set({ triggeredChats: triggered });
  },

  hasChatBeenTriggered: (chatId: string) => {
    return get().triggeredChats.has(chatId);
  },
}));
