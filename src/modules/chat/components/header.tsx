"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebarStore } from "@/modules/chat/store/sidebar-store";
import React from "react";
import { cn } from "@/lib/utils";

const Header = () => {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <div className="flex h-14 w-full flex-row justify-between items-center border-b border-border bg-sidebar px-4 py-2">
      <div className="flex items-center overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isOpen ? "w-0 opacity-0" : "w-8 opacity-100"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8"
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ModeToggle />
    </div>
  );
};

export default Header;
