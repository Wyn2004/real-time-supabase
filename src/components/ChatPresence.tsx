"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/brower";
import { useUser } from "@/hooks/useUser";

export default function ChatPresence() {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const { user } = useUser();
  const supabase = supabaseBrowser();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const userCount = Object.keys(newState).length;
        setOnlineUsers(userCount);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        const presenceTrackStatus = await channel.track({
          user_id: user.id,
          display_name: user.displayName || user.email,
          online_at: new Date().toISOString(),
        });

        console.log("Presence track status:", presenceTrackStatus);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  return (
    <div className="text-sm text-gray-600">
      <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
        {onlineUsers} {onlineUsers === 1 ? "user" : "users"} online
      </span>
    </div>
  );
}
