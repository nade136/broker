"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getMessagesForUser,
  sendUserMessage,
  markAdminMessagesReadByUser,
  clearMessagesForUser,
  type UserMessageRow,
} from "./actions";

export default function MessagesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UserMessageRow[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      try {
        const list = await getMessagesForUser(user.id);
        setMessages(list);
        await markAdminMessagesReadByUser(user.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSend = async () => {
    if (!body.trim() || !userId) return;
    setSending(true);
    setError("");
    try {
      await sendUserMessage(userId, body);
      const list = await getMessagesForUser(userId);
      setMessages(list);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (!userId || messages.length === 0) return;
    if (!confirm("Clear all messages in this conversation?")) return;
    setClearing(true);
    setError("");
    try {
      await clearMessagesForUser(userId);
      setMessages([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear messages");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages…</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Please sign in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#141d22] dark:text-gray-100">Messages</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Chat with support. Admin can reply from your user page.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your conversation with support. Only you and the admin can see these messages.
          </p>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearing}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {clearing ? "Clearing…" : "Clear messages"}
            </button>
          )}
        </div>
        <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-slate-800/50">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Send one below.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg px-3 py-2 text-sm ${
                  m.from_admin
                    ? "mr-4 bg-amber-500/15 text-[#141d22] dark:text-gray-100"
                    : "ml-4 bg-gray-200 text-[#141d22] dark:bg-slate-700 dark:text-gray-200"
                }`}
              >
                <span className="font-medium">{m.from_admin ? "Support" : "You"}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(m.created_at).toLocaleString()}
                </span>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-yellow-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="shrink-0 rounded-lg bg-[#141d22] px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
