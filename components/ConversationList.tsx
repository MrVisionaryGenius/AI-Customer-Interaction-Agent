'use client';

import { INTENT_COLOURS, type IntentCategory } from '@/lib/intents';
import type { PatientSummary } from '@/lib/supabase';

interface ConversationListProps {
  patients: PatientSummary[];
  selectedPhone: string | null;
  onSelect: (phone: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';

  const day = date.getDate();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${day} ${months[date.getMonth()]}`;
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="skeleton w-2 h-2 rounded-full mt-2 shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 w-32 rounded-[2px] mb-2" />
            <div className="skeleton h-3 w-full rounded-[2px]" />
          </div>
          <div className="skeleton h-3 w-12 rounded-[2px]" />
        </div>
      ))}
    </div>
  );
}

export default function ConversationList({
  patients,
  selectedPhone,
  onSelect,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const filtered = patients.filter((p) =>
    p.patient_phone.includes(searchQuery)
  );

  return (
    <div
      className="flex flex-col h-full border-r border-[#E5E7EB] bg-[#F9FAFB]"
      style={{ width: '320px', minWidth: '320px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-bold" style={{ fontSize: '16px' }}>
            Conversations
          </h2>
          <span
            className="bg-[#E5E7EB] text-[#6B7280] font-mono px-1.5 py-0.5 rounded-[2px]"
            style={{ fontSize: '12px' }}
          >
            {patients.length}
          </span>
        </div>
        <input
          type="text"
          placeholder="Search by phone number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border border-[#E5E7EB] rounded-[2px] px-3 py-1.5 text-sm bg-white outline-none focus:border-[#2563EB]"
          style={{ fontSize: '13px' }}
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {patients.length === 0 ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#9CA3AF]" style={{ fontSize: '14px' }}>
              No conversations yet
            </p>
          </div>
        ) : (
          filtered.map((patient) => {
            const isSelected = selectedPhone === patient.patient_phone;
            const intentColour =
              INTENT_COLOURS[patient.last_intent as IntentCategory] ??
              INTENT_COLOURS.general;

            return (
              <button
                key={patient.patient_phone}
                onClick={() => onSelect(patient.patient_phone)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-[#E5E7EB] transition-colors duration-150 ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-l-[3px] border-l-[#2563EB]'
                    : 'hover:bg-[#F9FAFB] border-l-[3px] border-l-transparent'
                }`}
              >
                {/* Intent dot */}
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: intentColour }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono font-medium text-[#111827] truncate"
                      style={{ fontSize: '14px' }}
                    >
                      {patient.patient_phone}
                    </span>
                    <span
                      className="font-mono text-[#9CA3AF] shrink-0 ml-2"
                      style={{ fontSize: '12px' }}
                    >
                      {formatRelativeTime(patient.last_message_at)}
                    </span>
                  </div>
                  <p
                    className="text-[#6B7280] truncate mt-0.5"
                    style={{ fontSize: '13px' }}
                  >
                    {patient.last_message}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
