import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CustomerMessage } from '../types';
import { supabase, fetchSupabaseMessages, createSupabaseMessage, updateSupabaseMessageReadStatus } from '../lib/supabase';

const MESSAGES_STORAGE_KEY = 'arabian_delights_customer_messages_v1';
const MESSAGE_BROADCAST_CHANNEL = 'arabian_delights_messages_bc';

export interface RealtimeMessageEvent {
  message: CustomerMessage;
  timestamp: number;
}

interface MessageContextType {
  messages: CustomerMessage[];
  unreadCount: number;
  latestRealtimeMessageEvent: RealtimeMessageEvent | null;
  sendCustomerMessage: (data: Omit<CustomerMessage, 'id' | 'read' | 'createdAt'>) => Promise<CustomerMessage>;
  markMessageRead: (messageId: string, read: boolean) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<CustomerMessage[]>(() => {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [latestRealtimeMessageEvent, setLatestRealtimeMessageEvent] = useState<RealtimeMessageEvent | null>(null);
  const globalBroadcastRef = useRef<any>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed writing messages to localStorage:', e);
    }
  }, [messages]);

  const mergeIncomingMessage = (newMsg: CustomerMessage, isNewRealtime: boolean = true) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === newMsg.id);
      if (exists) {
        return prev.map((m) => (m.id === newMsg.id ? { ...m, ...newMsg } : m));
      }
      return [newMsg, ...prev];
    });

    if (isNewRealtime) {
      setLatestRealtimeMessageEvent({
        message: newMsg,
        timestamp: Date.now(),
      });
    }
  };

  const loadMessages = async () => {
    const dbMsgs = await fetchSupabaseMessages();
    if (dbMsgs && dbMsgs.length > 0) {
      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m.id));
        const map = new Map<string, CustomerMessage>();
        let brandNewMessage: CustomerMessage | null = null;

        dbMsgs.forEach((m) => {
          map.set(m.id, m);
          if (!prevIds.has(m.id)) {
            if (!brandNewMessage || new Date(m.createdAt).getTime() > new Date(brandNewMessage.createdAt).getTime()) {
              brandNewMessage = m;
            }
          }
        });

        prev.forEach((m) => {
          if (!map.has(m.id)) {
            map.set(m.id, m);
          }
        });

        if (brandNewMessage && prev.length > 0) {
          setLatestRealtimeMessageEvent({
            message: brandNewMessage,
            timestamp: Date.now(),
          });
        }

        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Set up Supabase Realtime WebSocket Channels + Browser BroadcastChannel + Polling
  useEffect(() => {
    // 1. Supabase WebSocket Broadcast channel
    const broadcastChannel = supabase.channel('realtime:public:messages_global_channel');
    broadcastChannel
      .on('broadcast', { event: 'NEW_MESSAGE' }, (payload) => {
        console.log('[Realtime Message Broadcast] Received:', payload);
        if (payload?.payload?.id) {
          mergeIncomingMessage(payload.payload, true);
        }
      })
      .on('broadcast', { event: 'UPDATE_MESSAGE_READ' }, (payload) => {
        if (payload?.payload?.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === payload.payload.id ? { ...m, read: payload.payload.read } : m))
          );
        }
      })
      .subscribe();

    globalBroadcastRef.current = broadcastChannel;

    // 2. Supabase Postgres CDC Channel
    const cdcChannel = supabase
      .channel('realtime:public:messages_cdc')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            const newMsg: CustomerMessage = {
              id: row.id,
              name: row.name,
              email: row.email,
              phone: row.phone || '',
              message: row.message,
              read: Boolean(row.read),
              createdAt: row.created_at,
            };
            mergeIncomingMessage(newMsg, true);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            setMessages((prev) =>
              prev.map((m) => (m.id === row.id ? { ...m, read: Boolean(row.read) } : m))
            );
          }
        }
      )
      .subscribe();

    // 3. Browser BroadcastChannel API (Cross-Tab sync)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(MESSAGE_BROADCAST_CHANNEL);
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_MESSAGE' && event.data?.message) {
            mergeIncomingMessage(event.data.message, true);
          } else if (event.data?.type === 'UPDATE_MESSAGE_READ') {
            setMessages((prev) =>
              prev.map((m) => (m.id === event.data.id ? { ...m, read: event.data.read } : m))
            );
          }
        };
      }
    } catch {}

    // 4. Background polling sync fallback (4 seconds)
    const pollInterval = setInterval(() => {
      loadMessages();
    }, 4000);

    return () => {
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(cdcChannel);
      if (bc) bc.close();
      clearInterval(pollInterval);
    };
  }, []);

  const sendCustomerMessage = async (data: Omit<CustomerMessage, 'id' | 'read' | 'createdAt'>): Promise<CustomerMessage> => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newMsg: CustomerMessage = {
      id: `MSG-${Date.now()}-${randomNum}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update state
    mergeIncomingMessage(newMsg, true);

    // Broadcast cross-tab via BroadcastChannel
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(MESSAGE_BROADCAST_CHANNEL);
        bc.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
        bc.close();
      }
    } catch {}

    // Broadcast cross-device via Supabase WebSocket
    try {
      if (globalBroadcastRef.current) {
        globalBroadcastRef.current.send({
          type: 'broadcast',
          event: 'NEW_MESSAGE',
          payload: newMsg,
        });
      }
    } catch {}

    // Persist to Supabase Database
    createSupabaseMessage(newMsg).catch((err) => {
      console.warn('Supabase message persist error:', err);
    });

    return newMsg;
  };

  const markMessageRead = async (messageId: string, read: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read } : m))
    );

    try {
      if (globalBroadcastRef.current) {
        globalBroadcastRef.current.send({
          type: 'broadcast',
          event: 'UPDATE_MESSAGE_READ',
          payload: { id: messageId, read },
        });
      }
    } catch {}

    updateSupabaseMessageReadStatus(messageId, read).catch((err) => {
      console.warn('Update message read error:', err);
    });
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <MessageContext.Provider
      value={{
        messages,
        unreadCount,
        latestRealtimeMessageEvent,
        sendCustomerMessage,
        markMessageRead,
        refreshMessages: loadMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
