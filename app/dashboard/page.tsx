'use client';

import { useState, useEffect, useCallback } from 'react';
import ConversationList from '@/components/ConversationList';
import ThreadView from '@/components/ThreadView';
import PatientDetail from '@/components/PatientDetail';
import type { PatientSummary, MessageRow } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface PatientsResponse {
  patients: PatientSummary[];
}

interface MessagesResponse {
  messages: MessageRow[];
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen width
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Fetch patients on mount
  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients');
      const data = (await res.json()) as PatientsResponse;
      setPatients(data.patients ?? []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Fetch messages when patient selected
  const fetchMessages = useCallback(async (phone: string) => {
    setIsLoadingMessages(true);
    try {
      const encodedPhone = encodeURIComponent(phone);
      const res = await fetch(`/api/messages/${encodedPhone}`);
      const data = (await res.json()) as MessagesResponse;
      setMessages(data.messages ?? []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchMessages(selectedPhone);
    } else {
      setMessages([]);
    }
  }, [selectedPhone, fetchMessages]);

  // Supabase real-time subscription with polling fallback
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const channel = supabase
          .channel('messages-realtime')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
              const newMsg = payload.new as MessageRow;

              // Update conversation list
              fetchPatients();

              // If message is for selected patient, append it
              if (newMsg.patient_phone === selectedPhone) {
                setMessages((prev) => [...prev, newMsg]);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch {
        // Fall through to polling
      }
    }

    // Polling fallback every 5 seconds
    const pollInterval = setInterval(() => {
      fetchPatients();
      if (selectedPhone) {
        fetchMessages(selectedPhone);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [selectedPhone, fetchPatients, fetchMessages]);

  const handleSelectPatient = (phone: string) => {
    setSelectedPhone(phone);
  };

  const handleSendBooking = async (phone: string) => {
    try {
      const res = await fetch('/api/send-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        console.error('Failed to send booking');
      }
    } catch (err) {
      console.error('Send booking error:', err);
    }
  };

  // Get first contact for selected patient
  const selectedPatient = patients.find(
    (p) => p.patient_phone === selectedPhone
  );
  const firstContact = selectedPatient?.first_contact ?? null;

  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-white px-8">
        <p className="text-[#9CA3AF] text-center" style={{ fontSize: '14px' }}>
          Dashboard is optimised for desktop. Please use a screen wider than
          1024px.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <ConversationList
        patients={patients}
        selectedPhone={selectedPhone}
        onSelect={handleSelectPatient}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ThreadView
        messages={messages}
        selectedPhone={selectedPhone}
        firstContact={firstContact}
        isLoading={isLoadingMessages}
      />
      <PatientDetail
        phone={selectedPhone}
        messages={messages}
        firstContact={firstContact}
        onSendBooking={handleSendBooking}
      />
    </div>
  );
}
