"use client";
import { useState, useMemo, Fragment } from "react";
import Image from "next/image";
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
import {
  PlusIcon,
  SearchIcon,
  MenuIcon,
  EllipsisIcon,
  Trash,
} from "lucide-react";

const ChatSidebar = ({ user }: { user: any }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Image src={"/logo.svg"} alt="Logo" width={100} height={100} />
        </div>
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
        <div className="text-center text-sm text-muted-foreground py-8">
          No chats yet. Start a new chat!
        </div>
      </div>

      <div className="py-2 px-4 flex items-center gap-3 border-t border-border">
        <UserButton user={user} />
        <span className="flex-1 text-sm text-sidebar-foreground truncate">
          {user.email}
        </span>
      </div>
    </div>
  );
};

export default ChatSidebar;
