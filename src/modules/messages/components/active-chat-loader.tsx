"use client";

import { useGetChatById } from "@/modules/chat/hooks/chat";
import { useChatStore } from "@/modules/chat/store/chat-store";
import React, { useEffect } from "react";

const ActiveChatLoader = ({ chatId }: any) => {
  const { setActiveChatId, setMessages, addChat, chats } = useChatStore();

  const { data } = useGetChatById(chatId);

  useEffect(() => {
    if (!chatId) return;

    setActiveChatId(chatId);
  }, [chatId, setActiveChatId]);

  useEffect(() => {
    if (!data || !data.success || !data.data) return;

    const chat = {
      ...data.data,
      createdAt: data.data.createdAt.toISOString(),
      updatedAt: data.data.updatedAt.toISOString(),
      messages: data.data.messages.map((message: any) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      })),
    };

    // populate messages
    setMessages(chat.messages || []);

    if (!chats?.some((c) => c.id === chat.id)) {
      addChat(chat);
    }
  }, [data, setMessages, addChat, chats]);

  return null;
};

export default ActiveChatLoader;
