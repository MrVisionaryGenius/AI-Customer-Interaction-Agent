'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  INTENT_COLOURS,
  INTENT_LABELS,
  type IntentCategory,
} from '@/lib/intents';
import type { MessageRow } from '@/lib/supabase';

interface PatientDetailProps {
  phone: string | null;
  messages: MessageRow[];
  firstContact: string | null;
  onSendBooking: (phone: string) => Promise<void>;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${mins}`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 60) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

export default function PatientDetail({
  phone,
  messages,
  firstContact,
  onSendBooking,
}: PatientDetailProps) {
  const [lastActiveText, setLastActiveText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const updateLastActive = useCallback(() => {
    if (lastMessage) {
      setLastActiveText(formatRelativeTime(lastMessage.created_at));
    }
  }, [lastMessage]);

  useEffect(() => {
    updateLastActive();
    const interval = setInterval(updateLastActive, 30000);
    return () => clearInterval(interval);
  }, [updateLastActive]);

  if (!phone) {
    return (
      <div
        className="flex items-center justify-center h-full border-l border-[#E5E7EB]"
        style={{ width: '300px', minWidth: '300px' }}
      >
        <p className="text-[#9CA3AF] text-center px-4" style={{ fontSize: '14px' }}>
          Select a patient to view details
        </p>
      </div>
    );
  }

  // Collect unique intents
  const uniqueIntents = Array.from(
    new Set(messages.map((m) => m.intent).filter(Boolean))
  ) as IntentCategory[];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSendBooking = async () => {
    setIsSending(true);
    try {
      await onSendBooking(phone);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full border-l border-[#E5E7EB]"
      style={{ width: '300px', minWidth: '300px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <h3
          className="font-bold uppercase tracking-wider text-[#111827]"
          style={{ fontSize: '14px', letterSpacing: '0.05em' }}
        >
          Patient Details
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Phone */}
          <div>
            <p className="text-[#9CA3AF] mb-1" style={{ fontSize: '12px' }}>
              Phone
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono" style={{ fontSize: '16px' }}>
                {phone}
              </span>
              <button
                onClick={handleCopy}
                className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150"
                title="Copy phone number"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Total messages */}
          <div>
            <p className="text-[#9CA3AF] mb-1" style={{ fontSize: '12px' }}>
              Messages
            </p>
            <span className="font-mono font-bold" style={{ fontSize: '16px' }}>
              {messages.length}
            </span>
          </div>

          {/* First contact */}
          {firstContact && (
            <div>
              <p className="text-[#9CA3AF] mb-1" style={{ fontSize: '12px' }}>
                First contact
              </p>
              <span className="font-mono" style={{ fontSize: '13px' }}>
                {formatFullDate(firstContact)}
              </span>
            </div>
          )}

          {/* Last active */}
          <div>
            <p className="text-[#9CA3AF] mb-1" style={{ fontSize: '12px' }}>
              Last active
            </p>
            <span className="font-mono" style={{ fontSize: '13px' }}>
              {lastActiveText}
            </span>
          </div>

          {/* Intents seen */}
          {uniqueIntents.length > 0 && (
            <div>
              <p className="text-[#9CA3AF] mb-2" style={{ fontSize: '12px' }}>
                Intents seen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {uniqueIntents.map((intent) => {
                  const colour = INTENT_COLOURS[intent] ?? INTENT_COLOURS.general;
                  const label = INTENT_LABELS[intent] ?? intent;
                  return (
                    <span
                      key={intent}
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        fontSize: '11px',
                        border: `1px solid ${colour}`,
                        color: colour,
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick booking button */}
          <div className="mt-2">
            <button
              onClick={handleSendBooking}
              disabled={isSending}
              className="w-full bg-[#2563EB] text-white py-2 px-4 rounded-[4px] hover:bg-[#1D4ED8] transition-colors duration-150 disabled:opacity-50 font-medium"
              style={{ fontSize: '14px' }}
            >
              {isSending ? 'Sending...' : 'Send booking link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
