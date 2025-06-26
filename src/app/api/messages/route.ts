import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data: messages, error } = await supabase
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    // First ensure user exists in database
    const { error: userError } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || user.email,
      avatar_url: user.user_metadata?.avatar_url,
    });

    if (userError && userError.code !== "23505") {
      console.error("User upsert error:", userError);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        text: text.trim(),
        send_by: user.id,
        is_edit: false,
      })
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
      .single();

    if (messageError) {
      console.error("Message insert error:", messageError);
      return NextResponse.json(
        { error: messageError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
