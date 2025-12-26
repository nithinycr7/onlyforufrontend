'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Clock, ShieldCheck, Paperclip, Send, FileText, BarChart2, Crown, PlayCircle } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { api } from '@/lib/api';
import styles from './page.module.css';

interface Message {
    id: number | string;
    sender: string;
    role: 'user' | 'creator' | 'system';
    avatar: string;
    time: string;
    text: string;
    // ... other complex types (poll, media) kept if needed for future
}

interface ThreadData {
    id: string;
    title: string;
    subtitle: string;
    status: string;
    messages: Message[];
    currentUserId: string;
}

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const subId = typeof params?.id === 'string' ? params.id : '';
    const [message, setMessage] = useState('');
    const [thread, setThread] = useState<ThreadData | null>(null);
    const [loading, setLoading] = useState(true);
    const ws = useRef<WebSocket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch initial thread data
    useEffect(() => {
        const fetchThread = async () => {
            try {
                const res = await api.get(`/messages/thread/${subId}`);
                // Map backend response to UI format
                const data = res.data;
                const uiMessages = data.messages.map((m: any) => ({
                    id: m.id,
                    sender: m.is_fan_message ? 'You' : 'Creator', // Simplification
                    role: m.is_fan_message ? 'user' : 'creator',
                    avatar: m.is_fan_message
                        ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop'
                        : 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop',
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: m.content || (m.media_url ? 'Sent an attachment' : ''),
                }));

                setThread({
                    id: data.subscription_id,
                    title: data.title,
                    subtitle: data.subtitle,
                    status: data.status,
                    messages: uiMessages,
                    currentUserId: data.current_user_id
                });
            } catch (err) {
                console.error("Failed to fetch thread:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchThread();
    }, [subId]);

    // WebSocket Connection
    useEffect(() => {
        const token = getCookie('token');
        if (!token) return;

        // Clean up existing connection
        if (ws.current) ws.current.close();

        // Construct WebSocket URL from environment or API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = apiUrl.replace(/^https?:\/\//, '').replace('/api/v1', '');
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}://${wsBaseUrl}/api/v1/ws/connect`;
        const socket = new WebSocket(`${wsUrl}?token=${token}`);

        socket.onopen = () => {
            console.log('WS Connected');
            ws.current = socket;
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'message_new') {
                const newMsgRaw = data.data;
                // Only add if it belongs to this thread
                if (newMsgRaw.subscription_id === subId) {
                    const newMsg = {
                        id: newMsgRaw.id,
                        sender: newMsgRaw.is_fan_message ? 'You' : 'Creator',
                        role: (newMsgRaw.is_fan_message ? 'user' : 'creator') as 'user' | 'creator',
                        avatar: newMsgRaw.is_fan_message
                            ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop'
                            : 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=50&h=50&fit=crop',
                        time: new Date(newMsgRaw.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        text: newMsgRaw.content,
                    };

                    setThread(prev => prev ? ({
                        ...prev,
                        messages: [...prev.messages, newMsg] // @ts-ignore
                    }) : null);
                }
            }
        };

        return () => {
            socket.close();
        };
    }, [subId]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [thread?.messages]);

    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            await api.post('/messages/send', {
                subscription_id: subId,
                message_type: 'text',
                content: message
            });
            setMessage('');
            // Optimistic update or wait for WS? 
            // Better wait for WS or successful response to append, but WS is cleaner for sync logic.
            // Let's rely on backend response first to feel faster? 
            // Actually, WS will broadcast it back to me too if logic dictates, 
            // but usually send_message returns the message. 
            // Note: My backend WS logic only sends to RECEIVER. 
            // So I MUST append it here manually for myself.

            // NOTE: The previous backend logic:
            // await manager.send_personal_message(..., str(creator_user_id)) -> sends to Creator.
            // It does NOT echo back to me (Sender).
            // So I must append my own message locally.

            const tempMsg = {
                id: Date.now(),
                sender: 'You',
                role: 'user' as const,
                avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: message
            };
            setThread(prev => prev ? ({
                ...prev,
                messages: [...prev.messages, tempMsg]
            }) : null);

        } catch (err) {
            console.error("Failed to send:", err);
        }
    };

    if (loading) return <div className={styles.container} style={{ display: 'flex', justifyContent: 'center' }}>Loading...</div>;
    if (!thread) return <div className={styles.container}>Thread not found</div>;

    return (
        <main className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className={styles.backBtn} onClick={() => router.back()}>
                            <ChevronLeft size={24} color="#333" />
                        </button>
                        <div>
                            <div className={styles.serviceTitle}>{thread.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{thread.subtitle}</div>
                        </div>
                    </div>
                    <span className={`${styles.statusBadge} ${styles.statusClub}`}>
                        {thread.status}
                    </span>
                </div>
            </div>

            {/* Thread Area */}
            <div className={styles.chatArea} ref={scrollRef}>
                {thread.messages.map((msg: any) => (
                    <div key={msg.id} className={styles.messageGroup}>
                        <div className={styles.messageHeader}>
                            <img src={msg.avatar} className={styles.avatar} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                            <span className={styles.senderName}>{msg.sender}</span>
                            <span className={styles.timestamp}>{msg.time}</span>
                        </div>
                        <div className={`
                            ${styles.messageBubble} 
                            ${msg.role === 'user' ? styles.own : ''}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                <button style={{ padding: 8, color: 'var(--text-secondary)' }}><Paperclip size={24} /></button>
                <textarea
                    className={styles.textInput}
                    placeholder="Type a message..."
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <button className={styles.sendBtn} onClick={handleSend}><Send size={20} style={{ marginLeft: -2 }} /></button>
            </div>
        </main >
    );
}
