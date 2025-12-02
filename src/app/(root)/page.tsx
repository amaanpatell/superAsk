import { currentUser } from "@/modules/authentication/actions";
import ChatMessageView from "@/modules/authentication/components/chat-message-view";

export default async function Home() {
  const user = await currentUser();
  return <ChatMessageView user={user} />;
}
