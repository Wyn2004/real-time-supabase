"use client";
import { User } from "@/lib/types";
import { supabaseBrowser } from "@/lib/supabase/brower";
import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = supabaseBrowser();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName:
            session.user.user_metadata?.display_name || session.user.email,
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(),
        });
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          displayName:
            session.user.user_metadata?.display_name || session.user.email,
          avatarUrl: session.user.user_metadata?.avatar_url,
          createdAt: new Date(session.user.created_at),
          updatedAt: new Date(),
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
