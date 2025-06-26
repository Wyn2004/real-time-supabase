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
