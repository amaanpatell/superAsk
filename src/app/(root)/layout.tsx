import { auth } from "@/lib/auth";
import { currentUser } from "@/modules/authentication/actions";
import Header from "@/modules/chat/components/header";
import ChatSidebar from "@/modules/chat/components/chat-sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: any) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = await currentUser();

  if (!session) {
    return redirect("/sign-in");
  }
  return (
    <div className="flex  h-screen overflow-hidden">
      <ChatSidebar user={user} />
      <main className="flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
};

export default Layout;
