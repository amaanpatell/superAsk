"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useGetChatById } from "@/modules/chat/hooks/chat";
import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcwIcon, StopCircleIcon } from "lucide-react";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

import { Spinner } from "@/components/ui/spinner";
import { ModelSelector } from "@/modules/chat/components/model-selector";
import { useAIModels } from "@/modules/ai-agent/hook/ai-agent";
import { useChatStore } from "@/modules/chat/store/chat-store";
import { useCreateChat } from "@/modules/chat/hooks/chat";
import ChatWelcomeTabs from "@/modules/chat/components/chat-welcome-tabs";

interface MessageWithFormProps {
  chatId?: string | null;
  userName?: string;
}

const MessageWithForm = ({ chatId, userName }: MessageWithFormProps) => {
  const router = useRouter();
  const { data: models, isPending: isModelLoading } = useAIModels();
  const { data, isPending } = useGetChatById(chatId || "");
  const { hasChatBeenTriggered, markChatAsTriggered } = useChatStore();
  const { mutateAsync: createChat, isPending: isCreatingChat } =
    useCreateChat();

  const hasAutoTriggered = useRef(false);
  const searchParams = useSearchParams();
  const shouldAutoTrigger = searchParams.get("autoTrigger") === "true";

  const initialMessages = useMemo(() => {
    if (!chatId || !data?.data?.messages) return [];

    return data.data.messages
      .filter(
        (msg: { content?: string; id?: string }) =>
          msg.content && msg.content.trim() !== "" && msg.id
      )
      .map(
        (msg: {
          id: string;
          messageRole: string;
          content: string;
          createdAt: Date;
        }) => {
          try {
            const parts = JSON.parse(msg.content);

            return {
              id: msg.id,
              role: msg.messageRole.toLowerCase(),
              parts: Array.isArray(parts)
                ? parts
                : [{ type: "text", text: msg.content }],
              createdAt: msg.createdAt,
            };
          } catch (error) {
            return {
              id: msg.id,
              role: msg.messageRole.toLowerCase(),
              parts: [{ type: "text", text: msg.content }],
              createdAt: msg.createdAt,
            };
          }
        }
      );
  }, [data, chatId]);

  const modelFromData = data?.data?.model;
  const [userSelectedModel, setUserSelectedModel] = useState<
    string | undefined
  >(undefined);
  // Get default model - prefer OpenAI
  const getDefaultModel = () => {
    if (models?.models) {
      const openAIModel = models.models.find((m: any) => m.provider === "openai");
      return openAIModel?.id || models.models[0]?.id;
    }
    return undefined;
  };

  const selectedModel =
    userSelectedModel ?? modelFromData ?? getDefaultModel();
  const [input, setInput] = useState("");

  const { stop, messages, status, sendMessage, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Combine initial messages with messages from useChat, deduplicating by ID
  // Prioritize useChat messages (for streaming) over initial messages
  // This must be before any conditional returns to follow Rules of Hooks
  const messageToRender = useMemo(() => {
    const messageMap = new Map<string, any>();

    // Helper function to check if a message has content
    const hasContent = (msg: any) => {
      // Check if message has parts with text content
      if (msg.parts && Array.isArray(msg.parts)) {
        return msg.parts.some((p: any) => p.text && p.text.trim() !== "");
      }
      // Check if message has text property
      if (msg.text !== undefined) {
        return msg.text.trim() !== "";
      }
      // Check if message has content property
      if (msg.content) {
        return msg.content.trim() !== "";
      }
      return false;
    };

    // First, add initial messages (only if they have content)
    initialMessages.forEach((msg) => {
      if (msg.id && hasContent(msg)) {
        messageMap.set(msg.id, msg);
      }
    });

    // Then, add/overwrite with messages from useChat
    // This ensures streaming messages from useChat take priority
    messages.forEach((msg) => {
      if (msg.id) {
        // Always add messages from useChat, even if they seem empty
        // They might be streaming and updating
        if (hasContent(msg) || status === "streaming") {
          messageMap.set(msg.id, msg);
        }
      }
    });

    // Convert back to array and sort by creation time if available
    return Array.from(messageMap.values()).sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return 0;
    });
  }, [initialMessages, messages, status]);

  // Set default model - prefer OpenAI models
  useEffect(() => {
    if (models?.models && !selectedModel && !modelFromData) {
      // Find first OpenAI model, fallback to first available model
      const openAIModel = models.models.find((m: any) => m.provider === "openai");
      const defaultModel = openAIModel || models.models[0];
      if (defaultModel?.id) {
        setUserSelectedModel(defaultModel.id);
      }
    }
  }, [models, selectedModel, modelFromData]);

  // Auto-trigger for existing chats
  useEffect(() => {
    if (!chatId) return;
    if (hasAutoTriggered.current) return;
    if (!shouldAutoTrigger) return;
    if (hasChatBeenTriggered(chatId)) return;
    if (!selectedModel) return;
    if (initialMessages.length === 0) return;

    const lastMessage = initialMessages[initialMessages.length - 1];

    if (lastMessage.role !== "user") return;

    hasAutoTriggered.current = true;
    markChatAsTriggered(chatId);

    // Extract the actual text content from the last user message
    const getMessageText = (msg: any): string => {
      if (msg.parts && Array.isArray(msg.parts)) {
        const textParts = msg.parts
          .filter((p: any) => p.type === "text" && p.text)
          .map((p: any) => p.text);
        return textParts.join(" ");
      }
      if (msg.text) return msg.text;
      if (msg.content) return msg.content;
      return "";
    };

    const messageText = getMessageText(lastMessage);

    // Send the actual user message content instead of empty string
    // This ensures the message in state is the real query, not empty
    sendMessage(
      { text: messageText },
      {
        body: {
          model: selectedModel,
          chatId,
          skipUserMessage: true, // API won't save duplicate user message
        },
      }
    );

    router.replace(`/chat/${chatId}`, { scroll: false });
  }, [
    chatId,
    shouldAutoTrigger,
    selectedModel,
    initialMessages,
    markChatAsTriggered,
    hasChatBeenTriggered,
    sendMessage,
    router,
  ]);

  if (isPending && chatId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!input.trim()) return;
    if (!selectedModel) return;

    // If no chatId, create new chat first
    if (!chatId) {
      try {
        await createChat({
          content: input,
          model: selectedModel,
        });
        // Navigation handled by useCreateChat hook
        setInput("");
      } catch (error) {
        console.error("Error creating chat:", error);
      }
      return;
    }

    // Existing chat - send message directly
    sendMessage(
      { text: input },
      {
        body: {
          model: selectedModel,
          chatId,
        },
      }
    );

    setInput("");
  };

  const handleRetry = () => {
    regenerate();
  };

  const handleStop = () => {
    stop();
  };

  const handleModelSelect = (model: string) => {
    setUserSelectedModel(model);
  };

  const isNewChat = !chatId;
  const showWelcome = isNewChat && messageToRender.length === 0;

  return (
    <div className="max-w-5xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <Conversation className="h-full overflow-y-auto scrollbar-hidden">
          <ConversationContent>
            {showWelcome ? (
              <div className="flex flex-col items-center justify-center h-full space-y-10">
                <ChatWelcomeTabs userName={userName} />
              </div>
            ) : messageToRender.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Start a conversation...
              </div>
            ) : (
              messageToRender.map((message) => {
                // Check if this message is currently streaming
                const isMessageStreaming =
                  status === "streaming" &&
                  message.role === "assistant" &&
                  messages.some((m) => m.id === message.id);

                // Separate reasoning and text parts for better ordering
                const parts = message.parts || [];
                const reasoningParts = parts.filter(
                  (p: any) => p.type === "reasoning"
                );
                const textParts = parts.filter((p: any) => p.type === "text");

                return (
                  <Fragment key={message.id}>
                    {/* Render reasoning parts first */}
                    {reasoningParts.map(
                      (part: { type: string; text?: string }, i: number) => (
                        <Reasoning
                          className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
                          key={`${message.id}-reasoning-${i}`}
                          isStreaming={isMessageStreaming}
                          defaultOpen={true}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
                            {part.text || ""}
                          </ReasoningContent>
                        </Reasoning>
                      )
                    )}

                    {/* Render text parts */}
                    {textParts.map(
                      (part: { type: string; text?: string }, i: number) => (
                        <Message
                          from={message.role as "user" | "assistant" | "system"}
                          key={`${message.id}-text-${i}`}
                        >
                          <MessageContent>
                            <MessageResponse
                              className={
                                message.role === "user"
                                  ? "text-white dark:text-primary-foreground"
                                  : "max-w-4xl"
                              }
                            >
                              {part.text || ""}
                            </MessageResponse>
                          </MessageContent>
                        </Message>
                      )
                    )}
                  </Fragment>
                );
              })
            )}
            {status === "streaming" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner />
                <span className="text-sm">thinking...</span>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools className="flex items-center gap-2">
              {isModelLoading ? (
                <Spinner />
              ) : (
                <ModelSelector
                  models={models?.models}
                  selectedModelId={selectedModel}
                  onModelSelect={handleModelSelect}
                />
              )}
              {status === "streaming" ? (
                <PromptInputButton onClick={handleStop}>
                  <StopCircleIcon size={16} />
                  <span>Stop</span>
                </PromptInputButton>
              ) : (
                messages.length > 0 && (
                  <PromptInputButton onClick={handleRetry}>
                    <RotateCcwIcon size={16} />
                    <span>Retry</span>
                  </PromptInputButton>
                )
              )}
            </PromptInputTools>
            <PromptInputSubmit status={isCreatingChat ? "streaming" : status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default MessageWithForm;
