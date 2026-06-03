import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, ArrowLeft, Inbox } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/axios';
import { getSocket } from '@/utils/socket';
import { fadeUp, staggerContainer } from '../ui/motion';

interface ThreadSummary {
  _id: string; // threadId
  unread: number;
  last: {
    _id: string;
    content: string;
    createdAt: string;
    foodId: { _id: string; title: string };
    senderId: { _id: string; name: string; role: string };
    receiverId: { _id: string; name: string; role: string };
  };
}

interface Message {
  _id: string;
  content: string;
  createdAt: string;
  senderId: { _id: string; name: string; role: string };
  receiverId: { _id: string; name: string; role: string };
  read: boolean;
}

const MessagingPanel: React.FC = () => {
  const { user } = useAuth();
  const myId = (user as any)?._id || (user as any)?.id || '';
  const [inbox, setInbox] = useState<ThreadSummary[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [activeThread, setActiveThread] = useState<ThreadSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchInbox = useCallback(() => {
    api.get('/messages/inbox')
      .then((r) => setInbox(r.data))
      .catch(() => {})
      .finally(() => setLoadingInbox(false));
  }, []);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  // Socket listener for incoming messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (msg: Message) => {
      setMessages((p) => [...p, msg]);
      fetchInbox();
    };
    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [fetchInbox]);

  const openThread = async (thread: ThreadSummary) => {
    setActiveThread(thread);
    setLoadingMsgs(true);
    const peerId = thread.last.senderId._id === myId
      ? thread.last.receiverId._id
      : thread.last.senderId._id;
    const foodId = thread.last.foodId._id;
    try {
      const { data } = await api.get(`/messages/${foodId}?peerId=${peerId}`);
      setMessages(data);
      // Update unread count locally
      setInbox((p) => p.map((t) => t._id === thread._id ? { ...t, unread: 0 } : t));
    } catch { toast.error('Failed to load messages'); } finally { setLoadingMsgs(false); }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeThread) return;
    setSending(true);
    const peerId = activeThread.last.senderId._id === myId
      ? activeThread.last.receiverId._id
      : activeThread.last.senderId._id;
    const foodId = activeThread.last.foodId._id;
    try {
      const { data } = await api.post(`/messages/${foodId}`, { receiverId: peerId, content: input.trim() });
      setMessages((p) => [...p, data]);
      setInput('');
      fetchInbox();
    } catch { toast.error('Failed to send'); } finally { setSending(false); }
  };

  const getPeer = (thread: ThreadSummary) =>
    thread.last.senderId._id === myId ? thread.last.receiverId : thread.last.senderId;

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* ── Inbox sidebar ── */}
      <div className={`flex flex-col border-r border-gray-100 bg-gray-50/50 transition-all ${activeThread ? 'hidden md:flex w-72' : 'w-full md:w-72'}`}>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-4">
          <Inbox className="h-4 w-4 text-green-600" />
          <h3 className="font-bold text-gray-900">Inbox</h3>
          {inbox.reduce((s, t) => s + t.unread, 0) > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white px-1">
              {inbox.reduce((s, t) => s + t.unread, 0)}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingInbox ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-500" /></div>
          ) : inbox.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
              <MessageSquare className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-300">Start a conversation from a food listing</p>
            </div>
          ) : (
            inbox.map((thread) => {
              const peer = getPeer(thread);
              const isActive = activeThread?._id === thread._id;
              return (
                <button
                  key={thread._id}
                  onClick={() => openThread(thread)}
                  className={`w-full text-left border-b border-gray-100 px-4 py-3.5 transition ${isActive ? 'bg-green-50' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700 text-sm">
                      {peer.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${thread.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {peer.name}
                        </p>
                        {thread.unread > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[9px] font-bold text-white">
                            {thread.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-green-600 truncate">{thread.last.foodId.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{thread.last.content}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Message thread ── */}
      {activeThread ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Thread header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
            <button onClick={() => setActiveThread(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700">
              {getPeer(activeThread).name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{getPeer(activeThread).name}</p>
              <p className="text-xs text-green-600">{activeThread.last.foodId.title}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMsgs ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-500" /></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <MessageSquare className="h-8 w-8 text-gray-200" />
                <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId._id === myId;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMine
                      ? 'rounded-tr-sm bg-green-600 text-white'
                      : 'rounded-tl-sm bg-gray-100 text-gray-900'}`}
                    >
                      <p>{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${isMine ? 'text-green-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message…"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
                disabled={sending}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm hover:bg-green-700 disabled:opacity-40 transition"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center gap-3 md:flex">
          <MessageSquare className="h-12 w-12 text-gray-200" />
          <p className="font-semibold text-gray-500">Select a conversation</p>
          <p className="text-sm text-gray-400">Choose a thread from the left to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default MessagingPanel;
