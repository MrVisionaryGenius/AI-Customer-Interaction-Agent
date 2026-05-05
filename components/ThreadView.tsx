'use client';

import { useEffect, useRef } from 'react';
import type { MessageRow } from '@/lib/supabase';
import MessageBubble from './MessageBubble';

interface ThreadViewProps {
  messages: MessageRow[];
  selectedPhone: string | null;
  firstContact: string | null;
  isLoading: boolean;
}

function SkeletonThread() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className="skeleton rounded-[4px]"
            style={{
              width: `${180 + Math.random() * 120}px`,
              height: '44px',
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function ThreadView({
  messages,
  selectedPhone,
  firstContact,
  isLoading,
}: ThreadViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!selectedPhone) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF]">
        <svg
          className="w-12 h-12 mb-3 text-[#E5E7EB]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p style={{ fontSize: '14px' }}>Select a conversation</p>
      </div>
    );
  }

  const formatFirstContact = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Determine gaps between messages
  const getGap = (index: number): string => {
    if (index === 0) return '';
    const prev = messages[index - 1];
    const curr = messages[index];
    if (prev.direction !== curr.direction) return 'mt-4';
    return 'mt-1';
  };

  // Determine if we should show the date
  const shouldShowDate = (index: number): boolean => {
    if (index === 0) return true;
    const prev = new Date(messages[index - 1].created_at);
    const curr = new Date(messages[index].created_at);
    return prev.toDateString() !== curr.toDateString();
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <h2 className="font-mono font-bold" style={{ fontSize: '16px' }}>
          {selectedPhone}
        </h2>
        {firstContact && (
          <p className="text-[#9CA3AF]" style={{ fontSize: '12px' }}>
            First contact: {formatFirstContact(firstContact)}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <SkeletonThread />
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#9CA3AF]" style={{ fontSize: '14px' }}>
              No messages yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, index) => (
              <div key={msg.id} className={getGap(index)}>
                <MessageBubble
                  message={msg}
                  showDate={shouldShowDate(index)}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
