import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, FileUp, MessageCircle, Paperclip, Plus, Search, Send, Smile, Users, X, MoreVertical, Phone, Video, Mic, StopCircle, ChevronDown, Trash2, Edit2, Lock, Unlock, Settings, Trash, Reply, Copy, Star, Pin, Forward, CircleDashed, Megaphone, Sparkles, User, CreditCard, Box, Moon, Sun, BellOff, Ban, Clock, PhoneOff } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { createConversation, createSecureDirectChat, listConversations, listWorkspaceUsers, markAsRead, sendMessage, subscribeConversations, subscribeMessages, fetchMessages, deleteMessage, editMessage, deleteConversation, toggleLockConversation, togglePinMessage, toggleStarMessage, fetchStatuses, postStatus, type ChatConversation, type ChatMember, type ChatMessage } from '../services/chatService';
import { subscribePresence, type PresenceState } from '../lib/presence';
import { cn, errorMessage } from '../lib/utils';

function formatTime(value: string) { return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase(); }

const EMOJIS = ['😂','❤️','😍','🤣','😊','🙏','😭','😘','👍','😅','👏','😁','🔥','🥰','🤔','✅','🎉','🥲','✨','👍🏻','🤔'];

export default function Chat() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]); 
  const [conversation, setConversation] = useState<ChatConversation | null>(null); 
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presence, setPresence] = useState<PresenceState>({});
  
  const [query, setQuery] = useState(''); 
  const [body, setBody] = useState(''); 

  const loadList = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await listConversations(user.id, workspaceId);
      setConversations(data);
      setConversation(prev => prev ? data.find(c => c.id === prev.id) || prev : null);
    } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  }, [user?.id, workspaceId]);

  useEffect(() => {
    void loadList();
    if (!user?.id) return;
    const unsub = subscribeConversations(workspaceId, user.id, () => void loadList());
    const unsubPresence = subscribePresence(workspaceId, user.id, setPresence);
    return () => { unsub(); unsubPresence(); };
  }, [user?.id, workspaceId, loadList]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  const [activeTab, setActiveTab] = useState<'chats'|'status'|'channels'|'communities'|'ai'|'business'|'payments'|'settings'>('chats');
  
  const [showNew, setShowNew] = useState(false);
  const [newKind, setNewKind] = useState<'direct'|'group'>('direct');
  const [newTitle, setNewTitle] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<ChatMember[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<ChatMember[]>([]);
  const [targetToken, setTargetToken] = useState('');

  const [attachment, setAttachment] = useState<File | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [showThreadMenu, setShowThreadMenu] = useState(false);
  const [unlockedChats, setUnlockedChats] = useState<Set<string>>(new Set());

  // Functional UI States
  const [isCalling, setIsCalling] = useState<'video'|'audio'|null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [chatSearchMode, setChatSearchMode] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [forwardMsg, setForwardMsg] = useState<ChatMessage | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);

  // Local Settings
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [chatBg, setChatBg] = useState(() => localStorage.getItem('wa_chat_bg') || 'default');
  const [aiMessages, setAiMessages] = useState<{id: string, text: string, sender: 'user'|'ai'}[]>(() => {
    const saved = localStorage.getItem('meta_ai_chat');
    return saved ? JSON.parse(saved) : [{ id: '1', text: 'Halo! Saya Meta AI. Sistem simulasi antarmuka chat AI sudah aktif.', sender: 'ai' }];
  });
  const [aiInput, setAiInput] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const aiListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pendingReadsRef = useRef<Set<string>>(new Set());
  const flushTimerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('meta_ai_chat', JSON.stringify(aiMessages));
    if (aiListRef.current) aiListRef.current.scrollTo({ top: aiListRef.current.scrollHeight, behavior: 'smooth' });
  }, [aiMessages, activeTab]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushReads, 1000);
  }, []);

  const flushReads = useCallback(() => {
    if (!user?.id || !conversation) return;
    const ids = Array.from(pendingReadsRef.current);
    if (!ids.length) return;
    pendingReadsRef.current.clear();
    void markAsRead(conversation.id, ids, user.id);
  }, [user?.id, conversation]);

  const registerMessageEl = useCallback((id: string, el: HTMLElement | null) => {
    if (!el || !observerRef.current) return;
    if (el.dataset.unread === '1') {
      observerRef.current.observe(el);
    }
  }, []);

  useEffect(() => {
    if (!conversation) return;
    setError('');
    let active = true;
    if (conversation.is_locked && !unlockedChats.has(conversation.id)) {
      setMessages([]);
      return;
    }
    void fetchMessages(conversation.id).then(data => { if (!active) return; setMessages(data); }).catch(e => setError(errorMessage(e)));
    
    const unsub = subscribeMessages(conversation.id, () => {
      void fetchMessages(conversation.id).then(data => { if (!active) return; setMessages(data); });
    }, () => {});
    
    observerRef.current = new IntersectionObserver((entries) => {
      let marked = false;
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = (e.target as HTMLElement).dataset.messageId;
          if (id) { pendingReadsRef.current.add(id); marked = true; observerRef.current?.unobserve(e.target); }
        }
      });
      if (marked) scheduleFlush();
    }, { threshold: 0.5 });
    
    return () => {
      active = false;
      unsub();
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushReads();
    };
  }, [conversation?.id, conversation?.is_locked, unlockedChats, user?.id, scheduleFlush, flushReads]);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, conversation?.id]);

  useEffect(() => {
    if (showNew) void listWorkspaceUsers(workspaceId, userSearch).then(setUserResults).catch(() => setUserResults([]));
  }, [showNew, userSearch, workspaceId]);

  useEffect(() => {
    if (activeTab === 'status') {
      fetchStatuses(workspaceId).then(setStatuses).catch(e => {
        if (e.message?.includes('does not exist')) alert('Tabel chat_statuses belum ada! Jalankan file SQL 0034 di Supabase terlebih dahulu.');
      });
    }
  }, [activeTab, workspaceId]);

  const filteredConversations = useMemo(() => conversations.filter(c => `${c.title ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())), [conversations, query]);
  const displayMessages = useMemo(() => {
    if (!chatSearchMode || !chatSearchQuery) return messages;
    return messages.filter(m => m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()));
  }, [messages, chatSearchMode, chatSearchQuery]);

  function openConversation(c: ChatConversation) {
    if (c.is_locked && !unlockedChats.has(c.id)) {
      const pass = prompt('🔐 Chat ini dikunci (Chat Lock). Masukkan PIN (1234):');
      if (pass === '1234' || pass) { setUnlockedChats(prev => new Set(prev).add(c.id)); } else return;
    }
    setConversation(c);
    setMobileView('thread');
    setActiveMessageMenu(null);
    setShowThreadMenu(false);
    setReplyingTo(null);
    setEditingMessageId(null);
    setShowContactInfo(false);
    setChatSearchMode(false);
  }

  async function submit() {
    if (!conversation || !user?.id || (!body.trim() && !attachment)) return;
    let next = body;
    if (replyingTo) next = `> *Balasan ke ${replyingTo.senderName}:* ${replyingTo.body.substring(0, 30)}...\n\n` + next;
    
    if (editingMessageId) {
      try {
        await editMessage(editingMessageId, next);
        setEditingMessageId(null); setBody('');
      } catch (e) { setError(errorMessage(e)); }
      return;
    }

    setBody(''); setShowEmoji(false); setReplyingTo(null);
    const file = attachment; setAttachment(null);
    try { await sendMessage(conversation.id, user.id, next, file); } catch (e) { setBody(next); setAttachment(file); setError(errorMessage(e)); }
  }

  const handleAiSubmit = () => {
    if (!aiInput.trim()) return;
    const userMsg = { id: Date.now().toString(), text: aiInput, sender: 'user' as const };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Menarik! Anda baru saja bilang: "${userMsg.text}". Karena saya versi simulasi front-end, saya tidak benar-benar mengerti. Pasang OpenAI API Key Anda nanti untuk menghidupkan saya sepenuhnya!`,
        sender: 'ai'
      }]);
    }, 1000);
  };

  const handleToggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const handleChangeBg = (color: string) => { setChatBg(color); localStorage.setItem('wa_chat_bg', color); };
  const bgStyle = useMemo(() => {
    if (chatBg === 'default') return { backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png")', backgroundRepeat: 'repeat', opacity: isDarkMode ? 0.05 : 0.08 };
    return { backgroundColor: chatBg, opacity: 1 };
  }, [chatBg, isDarkMode]);

  // Message Actions
  const handleDeleteMessage = async (msgId: string) => { if (confirm('Hapus pesan ini?')) try { await deleteMessage(msgId); setActiveMessageMenu(null); } catch (e) { setError(errorMessage(e)); } };
  const handleEditMessage = (msg: ChatMessage) => { setBody(msg.body); setEditingMessageId(msg.id); setActiveMessageMenu(null); };
  const handleReplyMessage = (msg: ChatMessage) => { setReplyingTo(msg); setActiveMessageMenu(null); };
  const handleCopyMessage = (msg: ChatMessage) => { navigator.clipboard.writeText(msg.body); alert('Pesan disalin'); setActiveMessageMenu(null); };
  const handlePinMessage = async (msg: ChatMessage) => {
    try { await togglePinMessage(msg.id, !msg.is_pinned); setActiveMessageMenu(null); void loadList(); } catch (e) { alert('Gagal Pin: Pastikan Anda sudah menjalankan SQL migrasi fitur baru.'); }
  };
  const handleStarMessage = async (msg: ChatMessage) => {
    if (!user) return;
    try { await toggleStarMessage(user.id, msg.id, true); alert('Pesan diberi bintang!'); setActiveMessageMenu(null); } catch (e) { alert('Gagal Bintang: Pastikan Anda sudah menjalankan SQL migrasi fitur baru.'); }
  };
  const handleForwardMessage = async (cId: string) => {
    if (!forwardMsg || !user) return;
    try {
      await sendMessage(cId, user.id, `*Diteruskan*\n${forwardMsg.body}`);
      alert('Pesan berhasil diteruskan!');
      setForwardMsg(null);
    } catch(e) { alert('Gagal meneruskan: ' + errorMessage(e)); }
  };

  // Conversation Actions
  const handleDeleteChat = async () => { if (!conversation) return; if (!confirm('Anda yakin ingin menghapus seluruh obrolan ini secara permanen?')) return; try { await deleteConversation(conversation.id); setConversation(null); setMobileView('list'); void loadList(); } catch (e) { setError(errorMessage(e)); } };
  const handleClearChat = async () => { if (!conversation) return; if (!confirm('Bersihkan isi chat ini? (Hanya simulasi clear lokal untuk demo)')) return; setMessages([]); setShowThreadMenu(false); setShowContactInfo(false); };
  const handleToggleLock = async () => { if (!conversation) return; try { await toggleLockConversation(conversation.id, !conversation.is_locked); setShowThreadMenu(false); void loadList(); } catch (e) { setError(errorMessage(e)); } };

  // Status Action
  const handleCreateStatus = async () => {
    const text = prompt('Tulis status baru Anda:');
    if (!text || !user) return;
    try {
      await postStatus(workspaceId, user.id, text);
      alert('Status berhasil dibuat!');
      const data = await fetchStatuses(workspaceId);
      setStatuses(data);
    } catch(e) { alert('Gagal buat status: Pastikan SQL Migrasi 0034 telah dijalankan! Error: ' + errorMessage(e)); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voicenote.webm', { type: 'audio/webm' });
        try { if (conversation && user) await sendMessage(conversation.id, user.id, '🎤 Voice Note', file); } catch(e) { setError(errorMessage(e)); }
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start(); setIsRecording(true); setRecordingTime(0);
      recordIntervalRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch(e) { alert('Tidak bisa mengakses mikrofon: ' + errorMessage(e)); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); setIsRecording(false); clearInterval(recordIntervalRef.current);
    }
  };

  async function startChat() {
    if (!user?.id || selectedUsers.length === 0) return;
    try {
      const kind = newKind;
      const title = kind === 'direct' ? selectedUsers[0].name : (newTitle.trim() || 'Group Chat');
      let id = '';
      if (kind === 'direct') {
        if (!targetToken) { setError('Silakan masukkan token chat dari target.'); return; }
        id = await createSecureDirectChat(workspaceId, selectedUsers[0].id, targetToken);
      } else {
        id = await createConversation(workspaceId, kind, title, selectedUsers.map(x => x.id));
      }
      setShowNew(false); setSelectedUsers([]); setNewTitle(''); setUserSearch(''); setTargetToken('');
      const data = await listConversations(user.id, workspaceId);
      const created = data.find(c => c.id === id) ?? data[0];
      if (created) { setConversation(created); setMobileView('thread'); }
    } catch (e) { setError(errorMessage(e)); }
  }

  const partnerId = conversation?.kind === 'direct' ? messages.find(m => m.senderId !== user?.id)?.senderId : null;
  const isOnline = partnerId ? !!presence[partnerId] && presence[partnerId].length > 0 : false;
  const lastSeenStr = isOnline ? 'Online' : partnerId ? 'Offline' : '';

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800" onClick={() => { setActiveMessageMenu(null); setShowThreadMenu(false); }}>
      
      {/* 1. Mini Nav Sidebar */}
      <div className="w-[60px] flex-col items-center bg-[#f0f2f5] dark:bg-[#202c33] py-4 border-r border-slate-200 dark:border-slate-700 hidden md:flex shrink-0 z-20">
        <button onClick={() => setActiveTab('chats')} className={cn("p-3 rounded-xl mb-4 transition-colors", activeTab === 'chats' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Chats"><MessageCircle size={24} /></button>
        <button onClick={() => setActiveTab('status')} className={cn("p-3 rounded-xl mb-4 transition-colors", activeTab === 'status' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Status"><CircleDashed size={24} /></button>
        <button onClick={() => setActiveTab('channels')} className={cn("p-3 rounded-xl mb-4 transition-colors", activeTab === 'channels' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Channels"><Megaphone size={24} /></button>
        <button onClick={() => setActiveTab('communities')} className={cn("p-3 rounded-xl mb-4 transition-colors", activeTab === 'communities' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Communities"><Users size={24} /></button>
        <button onClick={() => setActiveTab('ai')} className={cn("p-3 rounded-xl mb-4 transition-colors", activeTab === 'ai' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Meta AI"><Sparkles size={24} /></button>
        
        <div className="mt-auto flex flex-col gap-4 items-center">
          <button onClick={() => setActiveTab('business')} className={cn("p-3 rounded-xl transition-colors", activeTab === 'business' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="WA Business"><Box size={24} /></button>
          <button onClick={() => setActiveTab('payments')} className={cn("p-3 rounded-xl transition-colors", activeTab === 'payments' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Payments"><CreditCard size={24} /></button>
          <button onClick={() => setActiveTab('settings')} className={cn("p-3 rounded-xl transition-colors", activeTab === 'settings' ? "bg-black/10 dark:bg-white/10 text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300")} title="Settings"><Settings size={24} /></button>
          <button className="p-2 mt-2 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-white" title="Profile"><User size={20} /></button>
        </div>
      </div>

      {/* 2. List Panel */}
      <div className={cn("flex w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-[380px] shrink-0 bg-white dark:bg-[#111b21]", mobileView === 'thread' && "hidden md:flex")}>
        {activeTab === 'chats' && (
          <>
            <div className="flex h-[60px] items-center justify-between px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Chats</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowNew(true)} className="p-2 text-slate-500 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/5 rounded-full"><Plus size={20} /></button>
                <button className="p-2 text-slate-500 hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/5 rounded-full"><MoreVertical size={20} /></button>
              </div>
            </div>
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111b21]">
              <div className="flex items-center gap-2 rounded-lg bg-[#f0f2f5] px-3 py-1.5 dark:bg-[#202c33]">
                <Search size={18} className="text-slate-500 dark:text-slate-400" />
                <input type="text" placeholder="Search chats..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent px-2 text-sm outline-none dark:text-white dark:placeholder:text-slate-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && <div className="p-5 text-center text-sm text-slate-400">Loading chats...</div>}
              {filteredConversations.map(c => (
                <button key={c.id} onClick={() => openConversation(c)} className={cn('flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]', conversation?.id === c.id && 'bg-[#f0f2f5] dark:bg-[#2a3942]')}>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-200 font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {c.kind === 'direct' ? <MessageCircle size={20} /> : <Users size={20} />}
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 pr-2 pt-1 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="truncate font-medium text-slate-900 dark:text-slate-100">{c.title || 'Unknown'}</h3>
                      <span className={cn("text-xs font-medium", c.unreadCount ? "text-green-500" : "text-slate-500")}>{formatTime(c.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {c.is_locked ? <><Lock size={12}/> Locked Chat</> : c.kind === 'direct' ? 'Tap to view messages' : 'Group Chat'}
                      </p>
                      {!!c.unreadCount && !c.is_locked && (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-green-500 text-[10px] font-bold text-white">{c.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="flex h-full flex-col bg-white dark:bg-[#111b21]">
             <div className="flex h-[60px] items-center px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
            </div>
            <div className="p-4 space-y-6 flex-1 overflow-y-auto">
               <div>
                 <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Tampilan</h3>
                 <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                   <div className="flex items-center gap-3"><Moon className="text-indigo-500"/><span className="font-medium text-slate-800 dark:text-slate-200">Dark Mode</span></div>
                   <button onClick={handleToggleTheme} className={cn("w-12 h-6 rounded-full transition-colors relative", isDarkMode ? "bg-indigo-600" : "bg-slate-300")}><div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", isDarkMode ? "translate-x-6" : "")}></div></button>
                 </div>
               </div>
               <div>
                 <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Wallpaper Chat</h3>
                 <div className="grid grid-cols-4 gap-2">
                   <button onClick={() => handleChangeBg('default')} className={cn("h-16 rounded-lg border-2", chatBg === 'default' ? "border-indigo-500" : "border-slate-200 dark:border-slate-700")} style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png")', backgroundSize: 'cover' }}></button>
                   <button onClick={() => handleChangeBg('#dcf8c6')} className={cn("h-16 rounded-lg border-2 bg-[#dcf8c6]", chatBg === '#dcf8c6' ? "border-indigo-500" : "border-slate-200 dark:border-slate-700")}></button>
                   <button onClick={() => handleChangeBg('#111b21')} className={cn("h-16 rounded-lg border-2 bg-[#111b21]", chatBg === '#111b21' ? "border-indigo-500" : "border-slate-200 dark:border-slate-700")}></button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Tab: Status */}
        {activeTab === 'status' && (
          <div className="flex h-full flex-col bg-white dark:bg-[#111b21]">
            <div className="flex h-[60px] items-center px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33]"><h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Status</h2></div>
            <div className="p-4 space-y-6">
              <button onClick={handleCreateStatus} className="flex items-center gap-4 w-full text-left">
                <div className="relative h-12 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700"><div className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-0.5 border-2 border-white dark:border-[#111b21]"><Plus size={14}/></div></div>
                <div><h3 className="font-bold text-slate-900 dark:text-slate-100">My status</h3><p className="text-sm text-slate-500 dark:text-slate-400">Click to add status update</p></div>
              </button>
              <div>
                <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">Recent updates</h4>
                {statuses.length === 0 && <p className="text-xs text-slate-500 italic">Tidak ada status dari kontak Anda.</p>}
                {statuses.map(s => (
                  <div key={s.id} className="flex items-center gap-4 w-full text-left py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-green-500 p-0.5"><div className="w-full h-full rounded-full bg-slate-400" /></div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{s.users?.name || 'User'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatTime(s.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === 'channels' && <div className="p-5 flex flex-col gap-4"><h2 className="text-xl font-bold dark:text-white mb-4">Channels</h2><Button onClick={() => alert('Channel creation simulated!')}>Create Channel</Button><Button variant="secondary" onClick={() => alert('Found 0 new channels in directory')}>Find Channels</Button></div>}
        {activeTab === 'communities' && <div className="p-5 flex flex-col gap-4"><h2 className="text-xl font-bold dark:text-white mb-4">Communities</h2><Button onClick={() => alert('Community created!')}>Start your community</Button></div>}
        {activeTab === 'business' && <div className="p-5"><h2 className="text-xl font-bold dark:text-white mb-4">WA Business</h2><ul className="space-y-3 dark:text-slate-300"><li>✓ Catalog Manager</li><li>✓ Auto-Replies</li><li>✓ Labels</li></ul></div>}
        {activeTab === 'payments' && <div className="p-5"><h2 className="text-xl font-bold dark:text-white mb-4">Payments</h2><Button onClick={() => alert('Add Payment Method triggered')}>Add Payment Method</Button></div>}
        {activeTab === 'ai' && <div className="p-5 text-center mt-10"><Sparkles className="mx-auto mb-2 text-indigo-500" size={48}/><h2 className="text-2xl font-bold dark:text-white">Meta AI</h2><p className="text-sm text-slate-500 mt-2">Gunakan panel utama di sebelah kanan untuk chat dengan AI.</p></div>}
      </div>
      
      {/* 3. Thread Panel / Contact Info Panel */}
      <div className={cn("flex-1 overflow-hidden relative", mobileView === 'list' && "hidden md:block")}>
        
        {isCalling && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-slate-900 text-white p-10 animate-in fade-in zoom-in duration-300">
            <div className="text-center mt-10">
              <h2 className="text-3xl font-bold mb-2">Memanggil {conversation?.title}...</h2>
              <p className="text-slate-400 flex items-center justify-center gap-2">{isCalling === 'video' ? <Video/> : <Phone/>} End-to-End Encrypted</p>
            </div>
            <div className="flex gap-6 mb-10">
              <button className="h-16 w-16 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center"><Mic size={28}/></button>
              {isCalling === 'video' && <button className="h-16 w-16 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center"><Video size={28}/></button>}
              <button onClick={() => setIsCalling(null)} className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center"><PhoneOff size={28}/></button>
            </div>
          </div>
        )}

        {/* ACTIVE: Meta AI Interface */}
        {activeTab === 'ai' ? (
          <div className="flex h-full flex-col bg-[#efeae2] dark:bg-[#0b141a]">
             <div className="flex h-[60px] items-center gap-3 px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] shadow-sm z-10">
               <button onClick={() => setMobileView('list')} className="md:hidden -ml-2 p-2 text-slate-500"><ArrowLeft size={20} /></button>
               <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white"><Sparkles size={20}/></div>
               <div><h3 className="font-bold text-slate-900 dark:text-slate-100">Meta AI</h3><span className="text-xs text-green-500">Online</span></div>
             </div>
             
             <div ref={aiListRef} className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
                {aiMessages.map(m => (
                  <div key={m.id} className={cn("flex", m.sender === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-lg p-3 text-[14.5px] shadow-sm", m.sender === 'user' ? "bg-[#d9fdd3] dark:bg-[#005c4b]" : "bg-white dark:bg-[#202c33] dark:text-slate-200")}>{m.text}</div>
                  </div>
                ))}
             </div>

             <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] z-10 flex gap-2">
               <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSubmit()} placeholder="Tanya Meta AI sesuatu..." className="flex-1 rounded-full bg-white px-4 py-2 outline-none dark:bg-[#2a3942] dark:text-white" />
               <button onClick={handleAiSubmit} className="h-10 w-10 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Send size={18}/></button>
             </div>
          </div>
        ) : conversation ? (
          <div className="flex h-full flex-col relative">
            <div className="absolute inset-0 pointer-events-none transition-all duration-300 z-0" style={bgStyle}></div>

            {/* Header */}
            <div className="flex h-[60px] shrink-0 items-center justify-between bg-[#f0f2f5] px-4 dark:bg-[#202c33] z-10 shadow-sm border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileView('list')} className="md:hidden -ml-2 p-2 text-slate-500"><ArrowLeft size={20} /></button>
                <div onClick={() => setShowContactInfo(!showContactInfo)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-300 font-bold text-slate-700 dark:bg-slate-600 dark:text-white cursor-pointer">{initials(conversation.title || '?')}</div>
                <div className="flex flex-col cursor-pointer" onClick={() => setShowContactInfo(!showContactInfo)}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{conversation.title}</h3>
                  {conversation.kind === 'direct' && <span className={cn("text-xs", isOnline ? "text-green-500" : "text-slate-500")}>{lastSeenStr}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 relative">
                {chatSearchMode ? (
                  <div className="flex items-center bg-white dark:bg-[#2a3942] rounded-lg px-2 mr-2">
                    <Search size={16}/>
                    <input autoFocus type="text" value={chatSearchQuery} onChange={e => setChatSearchQuery(e.target.value)} placeholder="Cari pesan..." className="bg-transparent border-none outline-none text-sm p-2 w-32 dark:text-white" />
                    <button onClick={() => { setChatSearchMode(false); setChatSearchQuery(''); }}><X size={16}/></button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setIsCalling('video')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><Video size={20}/></button>
                    <button onClick={() => setIsCalling('audio')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><Phone size={18}/></button>
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                    <button onClick={() => setChatSearchMode(true)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><Search size={20}/></button>
                  </>
                )}
                <button onClick={(e) => { e.stopPropagation(); setShowThreadMenu(!showThreadMenu); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><MoreVertical size={20}/></button>
                
                {showThreadMenu && (
                  <div className="absolute top-12 right-0 w-56 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    <button onClick={() => { setShowContactInfo(true); setShowThreadMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Contact Info</button>
                    <button onClick={() => alert('Mode Pilih Pesan Aktif')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Select Messages</button>
                    <button onClick={() => alert('Notifikasi dibisukan!')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Mute Notifications</button>
                    <button onClick={() => alert('Pesan Sementara diaktifkan!')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Disappearing Messages</button>
                    <button onClick={handleClearChat} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Clear Chat</button>
                    <button onClick={handleDeleteChat} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">Delete Chat</button>
                    <button onClick={handleToggleLock} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                      {conversation.is_locked ? 'Unlock Chat' : 'Lock Chat'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden z-10">
              <div className="flex flex-col flex-1 h-full">
                {/* Messages */}
                <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                  {displayMessages.map((m, idx) => {
                    const isMine = m.senderId === user?.id;
                    const prev = displayMessages[idx - 1];
                    const showHeader = !prev || prev.senderId !== m.senderId || new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > 300000;
                    const isReadByAll = conversation.kind === 'direct' ? m.readBy.length > 0 : m.readBy.length >= 1; 

                    let displayBody = m.body;
                    let quoteText = null;
                    if (m.body.startsWith('> *Balasan ke')) {
                      const parts = m.body.split('\n\n');
                      if (parts.length > 1) { quoteText = parts[0].replace('> ', ''); displayBody = parts.slice(1).join('\n\n'); }
                    }

                    return (
                      <div key={m.id} data-message-id={m.id} data-unread={!isMine && !m.readBy.includes(user!.id) ? '1' : '0'} ref={el => registerMessageEl(m.id, el)} className={cn("flex group", isMine ? "justify-end" : "justify-start", showHeader ? "mt-3" : "mt-1")}>
                        <div className={cn("relative max-w-[85%] rounded-lg px-2 pt-2 pb-1 shadow-sm md:max-w-[65%]", isMine ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none", m.is_deleted && "opacity-75 italic text-slate-500")}>
                          {showHeader && (
                            <div className={cn("absolute top-0 w-[8px] h-[13px]", isMine ? "-right-[8px] text-[#d9fdd3] dark:text-[#005c4b]" : "-left-[8px] text-white dark:text-[#202c33]")}>
                              {isMine ? (
                                <svg viewBox="0 0 8 13" fill="currentColor"><path opacity="0.13" fill="#0000000" d="M1.533 3.118L8 12.118V0H0C.4 0 1.2.8 1.533 3.118z"/><path opacity="0.96" d="M1.533 2.118L8 11.118V0H0C.4 0 1.2.8 1.533 2.118z"/></svg>
                              ) : (
                                <svg viewBox="0 0 8 13" fill="currentColor"><path opacity="0.13" fill="#000000" d="M1.533 3.118L8 12.118V0H0C.4 0 1.2.8 1.533 3.118z" transform="scale(-1, 1) translate(-8, 0)"/><path opacity="0.96" d="M1.533 2.118L8 11.118V0H0C.4 0 1.2.8 1.533 2.118z" transform="scale(-1, 1) translate(-8, 0)"/></svg>
                              )}
                            </div>
                          )}

                          {!isMine && showHeader && conversation.kind !== 'direct' && <div className="mb-1 text-[13px] font-bold text-indigo-500 px-1">{m.senderName}</div>}

                          {!m.is_deleted && (
                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 cursor-pointer p-1 text-slate-400 bg-gradient-to-l from-[#d9fdd3] dark:from-[#005c4b] z-20 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(m.id === activeMessageMenu ? null : m.id); }}><ChevronDown size={18} /></div>
                          )}

                          {/* Dropdown Menu */}
                          {activeMessageMenu === m.id && (
                            <div className="absolute right-4 top-8 w-40 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                              <button onClick={() => handleReplyMessage(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><Reply size={16}/> Reply</button>
                              <button onClick={() => handleCopyMessage(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><Copy size={16}/> Copy</button>
                              <button onClick={() => { setForwardMsg(m); setActiveMessageMenu(null); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><Forward size={16}/> Forward</button>
                              <button onClick={() => handlePinMessage(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">{m.is_pinned ? <Pin size={16} className="text-indigo-500"/> : <Pin size={16}/>} {m.is_pinned ? 'Unpin' : 'Pin'}</button>
                              <button onClick={() => handleStarMessage(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><Star size={16}/> Star</button>
                              {isMine && (
                                <>
                                  <button onClick={() => handleEditMessage(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700"><Edit2 size={16}/> Edit</button>
                                  <button onClick={() => handleDeleteMessage(m.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-red-600 dark:text-red-400"><Trash2 size={16}/> Delete</button>
                                </>
                              )}
                            </div>
                          )}

                          {quoteText && <div className="mb-1 rounded bg-black/5 dark:bg-black/20 p-2 text-[13px] text-slate-600 dark:text-slate-300 border-l-4 border-indigo-500">{quoteText}</div>}
                          
                          {m.attachmentUrl && !m.is_deleted && (
                            <div className="mb-1 px-1">
                              {m.attachmentType?.startsWith('image/') ? <img src={m.attachmentUrl} alt="Img" className="max-h-64 rounded-md object-cover cursor-pointer" />
                              : m.attachmentType?.startsWith('audio/') ? <audio src={m.attachmentUrl} controls className="h-10 w-full max-w-[250px]" />
                              : <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded bg-black/5 dark:bg-white/5 p-2 text-sm underline"><FileUp size={14}/> {m.attachmentName}</a>}
                            </div>
                          )}

                          <div className="flex items-end gap-2 px-1">
                            <div className="text-[14.5px] leading-relaxed text-slate-900 dark:text-[#e9edef] pb-2 min-w-0 break-words whitespace-pre-wrap">{displayBody}</div>
                            <div className="flex items-center gap-1 shrink-0 pb-1 -mr-0.5">
                              {m.is_pinned && <Pin size={12} className="text-slate-400"/>}
                              {m.is_edited && <span className="text-[10px] text-slate-400 italic mr-1">edited</span>}
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{formatTime(m.createdAt)}</span>
                              {isMine && !m.is_deleted && <span className={isReadByAll ? "text-blue-500" : "text-slate-400"}><CheckCheck size={14} /></span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Input area */}
                <div className="bg-[#f0f2f5] p-3 dark:bg-[#202c33] z-10 flex items-end gap-2 relative">
                  {editingMessageId && (
                    <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-[#111b21] p-3 border-t border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-20">
                      <div className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2"><Edit2 size={16}/> Mengedit pesan</div>
                      <button onClick={() => { setEditingMessageId(null); setBody(''); }}><X size={18} className="text-slate-500"/></button>
                    </div>
                  )}
                  {replyingTo && (
                    <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-[#111b21] p-3 border-t border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-20">
                      <div className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-l-4 border-indigo-500 pl-3"><div><div className="font-bold">{replyingTo.senderName}</div><div className="text-slate-500 dark:text-slate-400 truncate w-[200px]">{replyingTo.body}</div></div></div>
                      <button onClick={() => setReplyingTo(null)}><X size={18} className="text-slate-500"/></button>
                    </div>
                  )}
                  
                  <div className="flex gap-1 pb-1">
                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"><Smile size={24} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"><Paperclip size={24} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => setAttachment(e.target.files?.[0] || null)} />
                  </div>

                  <div className="flex-1 relative">
                    {showEmoji && <div className="absolute bottom-full left-0 mb-3 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 w-[280px] grid grid-cols-6 gap-2 z-50">{EMOJIS.map(e => <button key={e} onClick={() => setBody(b => b + e)} className="text-xl hover:bg-black/5 dark:hover:bg-white/5 rounded p-1">{e}</button>)}</div>}
                    {attachment && <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 rounded-lg bg-white p-2 text-sm shadow dark:bg-slate-700 z-50"><span className="truncate max-w-[200px]">{attachment.name}</span><button onClick={() => setAttachment(null)}><X size={14} className="text-red-500"/></button></div>}
                    <textarea value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit(); } }} placeholder="Ketik pesan..." className="w-full resize-none rounded-lg bg-white px-4 py-2.5 outline-none dark:bg-[#2a3942] dark:text-[#d1d7db] max-h-32 min-h-[44px]" rows={1} />
                  </div>

                  <div className="pb-1">
                    {body.trim() || attachment || editingMessageId ? (
                      <button onClick={() => void submit()} disabled={(!body.trim() && !attachment && !editingMessageId)} className="grid h-10 w-10 place-items-center rounded-full bg-[#00a884] text-white hover:bg-[#008f6f]"><Send size={18} className="ml-1" /></button>
                    ) : (
                      <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={cn("grid h-10 w-10 place-items-center rounded-full text-white transition-colors", isRecording ? "bg-red-500 animate-pulse" : "bg-[#00a884] hover:bg-[#008f6f]")}>
                        {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info Sidebar */}
              {showContactInfo && (
                <div className="w-[320px] bg-white dark:bg-[#111b21] border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 animate-in slide-in-from-right duration-200">
                  <div className="h-[60px] flex items-center gap-4 px-4 bg-[#f0f2f5] dark:bg-[#202c33] shrink-0">
                    <button onClick={() => setShowContactInfo(false)}><X className="text-slate-500"/></button>
                    <h2 className="font-semibold dark:text-slate-100">Contact Info</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 flex flex-col items-center bg-white dark:bg-[#111b21] shadow-sm mb-2">
                      <div className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-5xl font-bold mb-4">{initials(conversation.title || '?')}</div>
                      <h2 className="text-2xl font-semibold dark:text-white">{conversation.title}</h2>
                      <p className="text-slate-500">{conversation.kind === 'direct' ? userResults.find(u => u.id === partnerId)?.email || 'User Account' : 'Group Chat'}</p>
                    </div>
                    <div className="bg-white dark:bg-[#111b21] shadow-sm mb-2 p-4 space-y-4">
                      <div className="flex justify-between items-center"><span className="dark:text-white flex items-center gap-3"><BellOff size={18}/> Mute notifications</span></div>
                      <div className="flex justify-between items-center"><span className="dark:text-white flex items-center gap-3"><Clock size={18}/> Disappearing messages</span><span className="text-slate-400 text-sm">Off</span></div>
                    </div>
                    <div className="bg-white dark:bg-[#111b21] p-4 text-red-600 dark:text-red-400 space-y-4 font-medium">
                      <button onClick={handleClearChat} className="flex items-center gap-3 w-full text-left"><Trash2 size={18}/> Clear chat</button>
                      <button onClick={handleDeleteChat} className="flex items-center gap-3 w-full text-left"><Ban size={18}/> Block / Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {isRecording && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full flex items-center gap-3 animate-bounce shadow-xl z-50">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-mono text-sm">00:{recordingTime.toString().padStart(2, '0')}</span><span className="text-xs">Lepas untuk kirim</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-[#f0f2f5] p-10 text-center dark:bg-[#222e35]">
            <div className="mb-8 grid h-48 w-48 place-items-center rounded-full bg-slate-200 dark:bg-[#111b21]"><MessageCircle size={80} className="text-slate-400 dark:text-slate-600" /></div>
            <h2 className="mb-3 text-3xl font-light text-slate-800 dark:text-[#e9edef]">WhatsApp Web Clone</h2>
            <p className="text-slate-500 dark:text-[#8696a0] max-w-md">Kirim dan terima pesan dengan Enkripsi End-to-End.</p>
          </div>
        )}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Mulai Obrolan Baru">
        <div className="p-4">
          <div className="mb-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button className={cn("flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors", newKind === 'direct' ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")} onClick={() => { setNewKind('direct'); setSelectedUsers([]); }}>Chat Pribadi</button>
            <button className={cn("flex-1 rounded-md py-1.5 text-sm font-semibold transition-colors", newKind === 'group' ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")} onClick={() => { setNewKind('group'); setSelectedUsers([]); }}>Grup / Kelas</button>
          </div>
          <div className="space-y-4">
            {newKind === 'group' && (<div><label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Nama Grup</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" /></div>)}
            <div><label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Cari Pengguna</label><input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900" /></div>
            {selectedUsers.length > 0 && (<div className="flex flex-wrap gap-2">{selectedUsers.map(u => (<div key={u.id} className="flex items-center gap-1 rounded-full bg-indigo-100 py-1 pl-2 pr-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">{u.name}<button onClick={() => setSelectedUsers(x => x.filter(a => a.id !== u.id))} className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"><X size={12} /></button></div>))}</div>)}
            {newKind === 'direct' && selectedUsers.length === 1 && (<div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-900/20"><label className="mb-1 block text-xs font-bold text-orange-800 dark:text-orange-300 uppercase">Token Chat Target</label><input type="text" value={targetToken} onChange={e => setTargetToken(e.target.value.toUpperCase())} maxLength={6} className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900" /></div>)}
            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              {userResults.map(u => (<button key={u.id} type="button" className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50" onClick={() => { if (newKind === 'direct') setSelectedUsers([u]); else setSelectedUsers(x => x.some(s => s.id === u.id) ? x : [...x, u]); }}><div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-black dark:bg-slate-700">{initials(u.name)}</div><div className="flex-1"><div className="text-sm font-bold dark:text-slate-200">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></div></button>))}
            </div>
            <div className="mt-4 flex justify-end"><Button disabled={selectedUsers.length === 0 || (newKind === 'group' && selectedUsers.length < 1)} onClick={() => void startChat()}>Mulai Chat</Button></div>
          </div>
        </div>
      </Modal>

      <Modal open={!!forwardMsg} onClose={() => setForwardMsg(null)} title="Teruskan pesan ke...">
        <div className="p-4 space-y-2">
          {conversations.map(c => (
            <button key={c.id} onClick={() => handleForwardMessage(c.id)} className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border dark:border-slate-700 flex justify-between">
              <span className="font-medium dark:text-white">{c.title}</span><Send size={16} className="text-indigo-500"/>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
