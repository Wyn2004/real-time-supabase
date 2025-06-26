"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { supabaseBrowser } from "@/lib/supabase/brower";

export default function ChatInput() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const supabase = supabaseBrowser();

  const handleSendMessage = async (text: string) => {
    if (!user) {
      toast.error("You must be logged in to send messages");
      return;
    }

    if (!text.trim()) {
      toast.error("Message cannot be empty!");
      return;
    }

    setLoading(true);

    try {
      // Ensure user exists in database first
      const { error: userError } = await supabase.from("users").upsert([
        {
          id: user.id,
          email: user.email || "",
          display_name: user.displayName || user.email || "",
          avatar_url: user.avatarUrl || "",
        },
      ]);

      if (userError && userError.code !== "23505") {
        console.error("User upsert error:", userError);
        toast.error("Failed to save user info");
        return;
      }

      // Insert message - realtime sẽ tự động update UI
      const { error: messageError } = await supabase.from("messages").insert([
        {
          text: text.trim(),
          send_by: user.id,
          is_edit: false,
        },
      ]);

      if (messageError) {
        console.error("Message insert error:", messageError);
        toast.error(messageError.message);
        return;
      }

      // Không cần toast success vì realtime sẽ hiển thị message ngay
      console.log("Message inserted, realtime should update UI");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-5">
        <Input placeholder="Please log in to send messages" disabled />
      </div>
    );
  }

  return (
    <div className="p-5">
      <Input
        placeholder={loading ? "Sending..." : "Send message..."}
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) {
            handleSendMessage(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
      {loading && (
        <div className="text-xs text-gray-500 mt-1">Sending message...</div>
      )}
    </div>
  );
}
