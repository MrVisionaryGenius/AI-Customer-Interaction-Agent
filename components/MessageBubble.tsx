'use client';

import type { MessageRow } from '@/lib/supabase';

interface MessageBubbleProps {
  message: MessageRow;
  showDate: boolean;
}

export default function MessageBubble({ message, showDate }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const date = new Date(message.created_at);

  const formatTime = (d: Date): string => {
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const formatDateLabel = (d: Date): string => {
    const day = d.getDate();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${day} ${months[d.getMonth()]}`;
  };

  const timestamp = showDate
    ? `${formatDateLabel(date)} ${formatTime(date)}`
    : formatTime(date);

  return (
    <div
      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
    >
      <div
        className={`max-w-[70%] px-3 py-2 rounded-[4px] ${
          isInbound
            ? 'bg-[#F3F4F6] text-[#111827]'
            : 'bg-[#2563EB] text-white'
        }`}
        style={{ fontSize: '14px', lineHeight: '1.5' }}
      >
        {message.content}
      </div>
      <span
        className="font-mono text-[#9CA3AF] mt-0.5"
        style={{ fontSize: '11px' }}
      >
        {timestamp}
      </span>
    </div>
  );
}
