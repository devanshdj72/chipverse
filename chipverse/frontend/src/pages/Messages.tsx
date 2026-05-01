import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useUserContext } from "@/lib/user";
import api from "@/lib/api";
import {
  getSocket,
  joinConversation,
  sendSocketMessage,
  emitTyping,
  emitStopTyping,
} from "@/lib/socket";
import {
  Send, Users, Plus, Search, ArrowLeft, MessageSquare, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatUser { id: string; name: string; }
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatUser;
}
interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  members: { user: ChatUser }[];
  messages: Message[];
}

const getConvName = (conv: Conversation, myId: string) => {
  if (conv.isGroup) return conv.name ?? "Group";
  const other = conv.members.find((m) => m.user.id !== myId);
  return other?.user.name ?? "Unknown";
};
const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const Avatar = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const colors = [
    "from-blue-600 to-purple-600", "from-green-500 to-teal-600",
    "from-orange-500 to-red-600", "from-pink-500 to-rose-600",
    "from-cyan-500 to-blue-600", "from-violet-500 to-purple-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn("rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white flex-shrink-0", sizes[size], color)}>
      {getInitials(name)}
    </div>
  );
};

const CreateGroupModal = ({ friends, onClose, onCreate }: {
  friends: any[];
  onClose: () => void;
  onCreate: (conv: Conversation) => void;
}) => {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const handleCreate = async () => {
    if (!name.trim() || selected.length < 1) return;
    setLoading(true);
    try {
      const res = await api.chat.createGroup(name.trim(), selected);
      onCreate(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Create Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm mb-4 outline-none focus:border-blue-500/50"
          placeholder="Group name..." value={name} onChange={(e) => setName(e.target.value)}
        />
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Select friends</p>
        <div className="space-y-2 max-h-60 overflow-y-auto mb-5">
          {friends.map((f) => {
            const isSelected = selected.includes(f.id);
            return (
              <div key={f.id} onClick={() => toggle(f.id)}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                  isSelected ? "bg-blue-500/15 border border-blue-500/30" : "bg-white/3 border border-transparent hover:bg-white/8")}>
                <Avatar name={f.name} size="sm" />
                <span className="text-sm text-white flex-1">{f.name}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-400" />}
              </div>
            );
          })}
          {friends.length === 0 && <p className="text-gray-600 text-sm text-center py-4">No friends yet</p>}
        </div>
        <button onClick={handleCreate} disabled={loading || !name.trim() || selected.length < 1}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all">
          {loading ? "Creating..." : `Create Group (${selected.length} selected)`}
        </button>
      </div>
    </div>
  );
};

export default function Messages() {
  const { user, isAuthenticated } = useUserContext();
  const [, setLocation] = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const activeRef = useRef<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [showNewDM, setShowNewDM] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    if (!isAuthenticated) setLocation("/login");
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const [convRes, friendRes] = await Promise.all([
          api.chat.getConversations(),
          api.friends.getAll(),
        ]);
        setConversations(convRes.data ?? []);
        setFriends(friendRes.data ?? []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [isAuthenticated]);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let cleanup: (() => void) | null = null;

    const attach = () => {
      const socket = getSocket();
      if (!socket) return false;

      const onMessage = (msg: Message) => {
        if (activeRef.current?.id !== msg.conversationId) {
          // conversation not open — just update sidebar preview
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversationId ? { ...c, messages: [msg] } : c
            )
          );
          return;
        }

        setMessages((prev) => {
          // Replace matching temp message (same sender + content)
          const tempIdx = prev.findIndex(
            (m) =>
              m.id.startsWith("temp-") &&
              m.content === msg.content &&
              m.senderId === msg.senderId
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = msg;
            return updated;
          }
          // Avoid exact duplicate real ids
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === msg.conversationId ? { ...c, messages: [msg] } : c
          )
        );
      };

      const onTyping = ({ userId }: { userId: string }) => {
        if (userId === user?.id) return;
        setTypingUsers((prev) => new Set(prev).add(userId));
      };
      const onStopTyping = ({ userId }: { userId: string }) => {
        setTypingUsers((prev) => {
          const s = new Set(prev);
          s.delete(userId);
          return s;
        });
      };

      socket.on("receive_message", onMessage);
      socket.on("user_typing", onTyping);
      socket.on("user_stop_typing", onStopTyping);

      cleanup = () => {
        socket.off("receive_message", onMessage);
        socket.off("user_typing", onTyping);
        socket.off("user_stop_typing", onStopTyping);
      };
      return true;
    };

    if (!attach()) {
      const interval = setInterval(() => {
        if (attach()) clearInterval(interval);
      }, 500);
      return () => { clearInterval(interval); cleanup?.(); };
    }

    return () => { cleanup?.(); };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const openConversation = useCallback(async (conv: Conversation) => {
    setActive(conv);
    activeRef.current = conv;
    setMobileShowChat(true);
    setTypingUsers(new Set());
    joinConversation(conv.id);
    try {
      const res = await api.chat.getMessages(conv.id);
      setMessages(res.data ?? []);
    } catch (e) { console.error(e); }
  }, []);

  const openDM = async (friendId: string) => {
    setShowNewDM(false);
    setFriendSearch("");
    try {
      const res = await api.chat.openDM(friendId);
      const conv: Conversation = res.data;
      setConversations((prev) =>
        prev.find((c) => c.id === conv.id) ? prev : [conv, ...prev]
      );
      openConversation(conv);
    } catch (e) { console.error(e); }
  };

  const handleGroupCreated = (conv: Conversation) => {
    setShowCreateGroup(false);
    setConversations((prev) => [conv, ...prev]);
    openConversation(conv);
  };

  const handleSend = () => {
    if (!input.trim() || !active) return;
    const content = input.trim();
    setInput("");
    if (typingTimer.current) clearTimeout(typingTimer.current);
    emitStopTyping(active.id);

    // Optimistic message — will be replaced by real one from socket broadcast
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: active.id,
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name },
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Send via socket — server saves + broadcasts back to room including sender
    sendSocketMessage(active.id, content);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!active) return;
    emitTyping(active.id);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(active.id), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredConvs = conversations.filter((c) =>
    getConvName(c, user?.id ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(friendSearch.toLowerCase())
  );
  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const date = formatDate(msg.createdAt);
    const last = acc[acc.length - 1];
    if (last?.date === date) { last.msgs.push(msg); }
    else { acc.push({ date, msgs: [msg] }); }
    return acc;
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-black flex flex-col pt-16">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/8 flex flex-col bg-[#080810]",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}>
          <div className="px-4 pt-4 pb-3 border-b border-white/8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-white">Messages</h1>
              <div className="flex gap-2">
                <button onClick={() => setShowCreateGroup(true)} title="Create group"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Users className="w-4 h-4" />
                </button>
                <button onClick={() => setShowNewDM(true)} title="New message"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/40"
                placeholder="Search conversations..." value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {showNewDM && (
            <div className="border-b border-white/8 px-4 py-3 bg-white/3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Message</span>
                <button onClick={() => { setShowNewDM(false); setFriendSearch(""); }}>
                  <X className="w-4 h-4 text-gray-500 hover:text-white" />
                </button>
              </div>
              <input
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/40 mb-2"
                placeholder="Search friends..." value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)} autoFocus
              />
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredFriends.map((f) => (
                  <div key={f.id} onClick={() => openDM(f.id)}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-white/8 transition-all">
                    <Avatar name={f.name} size="sm" />
                    <span className="text-sm text-white">{f.name}</span>
                  </div>
                ))}
                {filteredFriends.length === 0 && (
                  <p className="text-gray-600 text-xs text-center py-3">No friends found</p>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-600 text-sm">Loading...</div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <MessageSquare className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-700 text-xs mt-1">Click + to message a friend</p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const name = getConvName(conv, user?.id ?? "");
                const lastMsg = conv.messages?.[0];
                const isActive = active?.id === conv.id;
                return (
                  <div key={conv.id} onClick={() => openConversation(conv)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-white/4",
                      isActive ? "bg-blue-500/10 border-l-2 border-l-blue-500" : "hover:bg-white/4"
                    )}>
                    <div className="relative">
                      <Avatar name={name} size="md" />
                      {conv.isGroup && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0d0d1a] border border-white/10 rounded-full flex items-center justify-center">
                          <Users className="w-2.5 h-2.5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white truncate">{name}</span>
                        {lastMsg && (
                          <span className="text-[10px] text-gray-600 flex-shrink-0 ml-2">
                            {formatTime(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {lastMsg.sender?.id === user?.id ? "You: " : `${lastMsg.sender?.name}: `}
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col bg-[#05050f]",
          !mobileShowChat ? "hidden md:flex" : "flex"
        )}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-white font-semibold mb-1">Your Messages</h2>
              <p className="text-gray-600 text-sm">Select a conversation or start a new one</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8 bg-[#080810]">
                <button
                  onClick={() => { setMobileShowChat(false); setActive(null); }}
                  className="md:hidden text-gray-400 hover:text-white mr-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar name={getConvName(active, user?.id ?? "")} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {getConvName(active, user?.id ?? "")}
                  </p>
                  {active.isGroup && (
                    <p className="text-xs text-gray-500">{active.members.length} members</p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {groupedMessages.map(({ date, msgs }) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-white/6" />
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest">{date}</span>
                      <div className="flex-1 h-px bg-white/6" />
                    </div>
                    {msgs.map((msg, i) => {
                      const isMe = msg.senderId === user?.id;
                      const showSender =
                        !isMe &&
                        active.isGroup &&
                        (i === 0 || msgs[i - 1]?.senderId !== msg.senderId);
                      return (
                        <div key={msg.id}
                          className={cn("flex", isMe ? "justify-end" : "justify-start", "mb-1")}>
                          <div className={cn(
                            "max-w-[72%] flex flex-col",
                            isMe ? "items-end" : "items-start"
                          )}>
                            {showSender && (
                              <span className="text-[10px] text-gray-500 mb-1 ml-1">
                                {msg.sender.name}
                              </span>
                            )}
                            <div className={cn(
                              "px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words",
                              isMe
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white/8 text-gray-100 rounded-bl-sm border border-white/6"
                            )}>
                              {msg.content}
                            </div>
                            <span className="text-[9px] text-gray-700 mt-0.5 px-1">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start mb-1">
                    <div className="bg-white/8 border border-white/6 rounded-2xl rounded-bl-sm px-4 py-2.5">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-white/8 bg-[#080810]">
                <div className="flex items-end gap-3">
                  <textarea
                    rows={1}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/40 resize-none max-h-32 leading-relaxed"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          friends={friends}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleGroupCreated}
        />
      )}
    </div>
  );
}