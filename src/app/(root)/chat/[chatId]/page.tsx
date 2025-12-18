import { currentUser } from "@/modules/authentication/actions";
import ActiveChatLoader from "@/modules/messages/components/active-chat-loader";
import MessageWithForm from "@/modules/messages/components/message-with-form";
import React from "react";

const Page = async ({ params }: any) => {
  const { chatId } = await params;
  const user = await currentUser();

  return (
    <>
      <ActiveChatLoader chatId={chatId} />
      <MessageWithForm chatId={chatId} userName={user?.name} />
    </>
  );
};

export default Page;
