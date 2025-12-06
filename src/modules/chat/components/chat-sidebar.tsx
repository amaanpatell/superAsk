"use client";
import { useState, useMemo, Fragment, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserButton from "@/modules/authentication/components/user-button";

import { cn } from "@/lib/utils";
import { SearchIcon, EllipsisIcon, Trash, PanelLeftClose } from "lucide-react";
import { useChatStore } from "../store/chat-store";
import { useSidebarStore } from "../store/sidebar-store";
import DeleteChatModal from "./modal/chat-delete-modal";
import { Chat, GroupedChats, ChatSidebarProps } from "@/types";

const ChatSidebar = ({ user, chats }: ChatSidebarProps) => {
  const { activeChatId } = useChatStore();
  const { isOpen, close } = useSidebarStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Close sidebar on mobile screens on initial load
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      close();
    }
  }, []);

  // Close sidebar when clicking on a chat link on mobile
  const handleChatClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      close();
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }

    const query = searchQuery.toLowerCase();

    return chats.filter(
      (chat) =>
        chat.title?.toLowerCase().includes(query) ||
        chat.messages?.some((msg) => msg.content?.toLowerCase().includes(query))
    );
  }, [chats, searchQuery]);

  const groupedChats = useMemo<GroupedChats>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: GroupedChats = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);

      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId);
    setIsModalOpen(true);
  };

  const renderChatList = (chatList: Chat[]) => {
    if (chatList.length === 0) return null;

    return chatList.map((chat) => (
      <Fragment key={chat.id}>
        <Link
          href={`/chat/${chat.id}`}
          className={cn(
            "block rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            chat.id === activeChatId && "bg-sidebar-accent"
          )}
          onClick={handleChatClick}
        >
          <div className="flex flex-row justify-between items-center gap-2">
            <span className="truncate flex-1">{chat.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 group-hover:opacity-100 hover:bg-sidebar-accent-foreground/10"
                  onClick={(e) => e.preventDefault()}
                >
                  <EllipsisIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex flex-row gap-2 cursor-pointer"
                  onClick={(e) => onDelete(e, chat.id)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>
        {selectedChatId === chat.id && (
          <DeleteChatModal
            chatId={chat.id}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        )}
      </Fragment>
    ));
  };

  return (
    <>
      {/* Mobile overlay - only shows on screens < 768px when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
          // On mobile: fixed position with overlay behavior
          // On desktop: normal relative positioning
          "fixed md:relative z-50 md:z-auto",
          isOpen ? "w-64" : "w-0 border-r-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-4xl font-semibold">SuperAsk</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              className="h-8 w-8 hover:bg-sidebar-accent"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4">
            <Link href={"/"}>
              <Button className="w-full font-semibold">New Chat</Button>
            </Link>
          </div>
          <div className="px-4 pb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chats..."
                className="pl-10 bg-sidebar-accent border-sidebar-b pr-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {filteredChats.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                {searchQuery ? "No Chats Found" : "No Chats Yet"}
              </div>
            ) : (
              <>
                {groupedChats.today.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                      Today
                    </div>
                    {renderChatList(groupedChats.today)}
                  </div>
                )}

                {groupedChats.yesterday.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                      Yesterday
                    </div>
                    {renderChatList(groupedChats.yesterday)}
                  </div>
                )}

                {groupedChats.lastWeek.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                      Last 7 Days
                    </div>
                    {renderChatList(groupedChats.lastWeek)}
                  </div>
                )}

                {groupedChats.older.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                      Older
                    </div>
                    {renderChatList(groupedChats.older)}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 flex items-center gap-3 border-t border-border">
            <UserButton user={{ ...user, image: user.image ?? null }} />
            <span className="flex-1 text-sm text-sidebar-foreground truncate">
              {user.email}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
