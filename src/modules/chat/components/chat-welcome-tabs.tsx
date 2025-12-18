import React from "react";

interface ChatWelcomeTabsProps {
  userName?: string;
}

const ChatWelcomeTabs = ({ userName }: ChatWelcomeTabsProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-semibold">
          How can I help you,{" "}
          {userName?.slice(0, userName.indexOf(" ")) || userName}?
        </h1>
      </div>
    </div>
  );
};

export default ChatWelcomeTabs;
