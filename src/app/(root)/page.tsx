import { currentUser } from "@/modules/authentication/actions";
import MessageWithForm from "@/modules/messages/components/message-with-form";

export default async function Home() {
  const user = await currentUser();
  
  return <MessageWithForm chatId={null} userName={user?.name} />;
}