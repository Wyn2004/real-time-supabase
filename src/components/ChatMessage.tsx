"use client";
import { MessageWithUser } from "@/lib/types";

interface ChatMessageProps {
  message: MessageWithUser;
  isOwn: boolean;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  return (
    <div
      className={`flex gap-3 p-4 hover:bg-gray-50 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex-shrink-0">
        {/* {message.user.avatarUrl ? (
          <Image
            src={message.user.avatarUrl}
            alt={message.user.displayName || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : ( */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">
              {message.user.displayName?.charAt(0) || "U"}
            </span>
          </div>
        {/* )} */}
      </div>

      <div className={`flex-1 min-w-0 ${isOwn ? "text-right" : "text-left"}`}>
        <div
          className={`flex items-center gap-2 mb-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-sm font-medium text-gray-900">
            {message.user.displayName || "Anonymous"}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(message.createdAt)}
          </span>
        </div>

        <div
          className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
            isOwn
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          <p className="text-sm break-words">{message.text}</p>
        </div>
      </div>
    </div>
  );
}
