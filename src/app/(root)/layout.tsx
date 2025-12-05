import { auth } from "@/lib/auth";
import { currentUser } from "@/modules/authentication/actions";
import Header from "@/modules/chat/components/header";
import ChatSidebar from "@/modules/chat/components/chat-sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { getAllChats } from "@/modules/chat/actions";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/sign-in");
  }

  const user = await currentUser();
  const { data: chats } = await getAllChats();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar user={user} chats={chats || []} />
      <main className="flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
};

export default Layout;
