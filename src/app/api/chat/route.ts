import { convertToModelMessages, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import crypto from "crypto";
import db from "@/lib/db";
import { MessageRole, MessageType } from "@prisma/client";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";

/* ---------------- PROVIDERS ---------------- */

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

function getModelProvider(modelId: string) {
  if (modelId.startsWith("gpt-")) return openai(modelId);
  if (modelId.startsWith("gemini-")) return google(modelId);
  throw new Error(`Unsupported model: ${modelId}`);
}

/* ---------------- HELPERS ---------------- */

function convertStoredMessageToUI(msg: any) {
  try {
    const parts = JSON.parse(msg.content);
    return {
      id: msg.id, // Use original message ID from database
      role: msg.messageRole.toLowerCase(),
      parts: parts.filter((p: any) => p.type === "text"),
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id, // Use original message ID from database
      role: msg.messageRole.toLowerCase(),
      parts: [{ type: "text", text: msg.content }],
      createdAt: msg.createdAt,
    };
  }
}

function extractPartsAsJSON(message: any) {
  if (Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  return JSON.stringify([{ type: "text", text: message.content || "" }]);
}

function dedupeMessages(messages: any[]) {
  const map = new Map<string, any>();
  for (const msg of messages) {
    map.set(msg.id, msg);
  }
  return Array.from(map.values());
}

/* ---------------- API HANDLER ---------------- */

export async function POST(req: Request) {
  try {
    const {
      chatId,
      messages: newMessages,
      model,
      skipUserMessage,
    } = await req.json();

    if (!model) {
      return new Response(JSON.stringify({ error: "Model is required" }), {
        status: 400,
      });
    }

    /* -------- Handle messages -------- */
    
    // If messages are provided in the request, filter out empty messages
    // If all messages are empty or no messages, fetch from database
    let allUIMessages: any[];
    
    // Filter out empty messages from the request
    const validMessages = newMessages && Array.isArray(newMessages)
      ? newMessages.filter((msg: any) => {
          // Filter out messages with empty text content
          if (msg.text && msg.text.trim() === "") return false;
          if (msg.parts && Array.isArray(msg.parts)) {
            const hasContent = msg.parts.some((p: any) => 
              p.text && p.text.trim() !== ""
            );
            return hasContent;
          }
          return true;
        })
      : [];
    
    // If we have valid messages and skipUserMessage is false, use them
    // If skipUserMessage is true, always fetch from database to get the full context
    if (skipUserMessage || validMessages.length === 0) {
      // Fetch from database (for auto-trigger or when no valid messages)
      const prevMessages = chatId
        ? await db.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
          })
        : [];

      allUIMessages = prevMessages.map(convertStoredMessageToUI);
    } else {
      // Use valid messages from request
      allUIMessages = validMessages;
    }

    /* -------- Normalize and ensure unique IDs -------- */
    
    // Ensure all messages have IDs and normalize format
    const normalizedMessages = allUIMessages.map((msg) => ({
      ...msg,
      id: msg.id || crypto.randomUUID(),
    }));

    /* -------- Deduplicate by ID -------- */
    
    const deduplicatedMessages = dedupeMessages(normalizedMessages);

    /* -------- Convert to model messages -------- */

    let modelMessages;

    try {
      modelMessages = convertToModelMessages(deduplicatedMessages);
    } catch {
      modelMessages = deduplicatedMessages
        .map((msg) => ({
          role: msg.role,
          content: msg.parts
            ?.filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("\n"),
        }))
        .filter((m) => m.content);
    }

    /* -------- Stream response -------- */

    const result = streamText({
      model: getModelProvider(model),
      messages: modelMessages,
      system: CHAT_SYSTEM_PROMPT,
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,

      /* 🚨 DO NOT PASS originalMessages 🚨 */

      onFinish: async ({ responseMessage }) => {
        try {
          if (!chatId) return; // Can't save without chatId

          const toSave = [];

          if (!skipUserMessage) {
            // Find the last user message (should be the new one)
            const lastUserMsg = [...deduplicatedMessages]
              .reverse()
              .find((msg) => msg.role === "user");

            if (lastUserMsg?.role === "user") {
              const messageContent = extractPartsAsJSON(lastUserMsg);
              
              // Check if this message already exists in DB (by ID or by content)
              const existingById = lastUserMsg.id
                ? await db.message.findUnique({
                    where: { id: lastUserMsg.id },
                  })
                : null;
              
              // Also check by content to avoid duplicates even if ID differs
              const existingByContent = existingById
                ? null
                : await db.message.findFirst({
                    where: {
                      chatId,
                      content: messageContent,
                      messageRole: MessageRole.USER,
                    },
                  });

              if (!existingById && !existingByContent) {
                toSave.push({
                  chatId,
                  content: messageContent,
                  messageRole: MessageRole.USER,
                  messageType: MessageType.NORMAL,
                  model,
                });
              }
            }
          }

          if (responseMessage?.parts?.length) {
            toSave.push({
              chatId,
              content: extractPartsAsJSON(responseMessage),
              messageRole: MessageRole.ASSISTANT,
              messageType: MessageType.NORMAL,
              model,
            });
          }

          if (toSave.length) {
            await db.message.createMany({ data: toSave });
          }
        } catch (err) {
          console.error("❌ Failed to save messages:", err);
        }
      },
    });
  } catch (error: any) {
    console.error("❌ Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      { status: 500 }
    );
  }
}
