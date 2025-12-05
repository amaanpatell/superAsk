import { create } from "zustand";

type ChatStore = {
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  activeChatId: null,
  setActiveChatId: (chatId: string | null) => set({ activeChatId: chatId }),
}));
