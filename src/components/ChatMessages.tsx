"use client";
import { useEffect, useState, useRef } from "react";
import { MessageWithUser } from "@/lib/types";
import { supabaseBrowser } from "@/lib/supabase/brower";
import { useUser } from "@/hooks/useUser";
import ChatMessage from "./ChatMessage";

export default function ChatMessages() {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const supabase = supabaseBrowser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          text,
          send_by,
          is_edit,
          created_at,
          users!messages_send_by_fkey (
            id,
            display_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMessages: MessageWithUser[] = data.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          sendBy: msg.send_by,
          isEdit: msg.is_edit,
          createdAt: new Date(msg.created_at),
          user: {
            id: msg.users.id,
            displayName: msg.users.display_name,
            avatarUrl: msg.users.avatar_url,
          },
        }));
        setMessages(formattedMessages);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime changes - chỉ cần này thôi!
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("Realtime new message:", payload);

          // Fetch the complete message with user data
          const { data: newMessage, error } = await supabase
            .from("messages")
            .select(
              `
              id,
              text,
              send_by,
              is_edit,
              created_at,
              users!messages_send_by_fkey (
                id,
                display_name,
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && newMessage) {
            // Handle both array and single object cases for users
            const userData = Array.isArray(newMessage.users)
              ? newMessage.users[0]
              : newMessage.users;

            const formattedMessage: MessageWithUser = {
              id: newMessage.id,
              text: newMessage.text,
              sendBy: newMessage.send_by,
              isEdit: newMessage.is_edit,
              createdAt: new Date(newMessage.created_at),
              user: {
                id: userData.id,
                displayName: userData.display_name,
                avatarUrl: userData.avatar_url,
              },
            };

            // Chỉ add nếu chưa có (tránh duplicate)
            setMessages((prev) => {
              if (prev.find((m) => m.id === formattedMessage.id)) {
                return prev;
              }
              return [...prev, formattedMessage];
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">
          No messages yet. Start the conversation!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.sendBy === user?.id}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
