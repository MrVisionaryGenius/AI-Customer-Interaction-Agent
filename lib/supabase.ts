import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface MessageRow {
  id: string;
  patient_phone: string;
  direction: 'inbound' | 'outbound';
  content: string;
  intent: string;
  created_at: string;
  wa_message_id?: string;
}

interface PatientSummary {
  patient_phone: string;
  last_message: string;
  last_message_at: string;
  last_intent: string;
  total_messages: number;
  first_contact: string;
}

export type { MessageRow, PatientSummary };

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

let serverClient: SupabaseClient | null = null;
let browserClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return serverClient;
}

export function getSupabaseBrowser(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

let tableVerified = false;

export async function ensureMessagesTable(): Promise<void> {
  if (tableVerified) return;

  const supabase = getSupabaseServer();

  try {
    const { error } = await supabase.from('messages').select('id').limit(1);

    if (error && error.message.includes('does not exist')) {
      console.error(
        'Messages table does not exist. Please create it in Supabase with this SQL:\n' +
          'CREATE TABLE messages (\n' +
          '  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n' +
          '  patient_phone text NOT NULL,\n' +
          "  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),\n" +
          '  content text NOT NULL,\n' +
          "  intent text NOT NULL DEFAULT 'general',\n" +
          '  wa_message_id text,\n' +
          '  created_at timestamptz DEFAULT now()\n' +
          ');\n' +
          'CREATE INDEX idx_messages_patient_phone ON messages(patient_phone);\n' +
          'CREATE INDEX idx_messages_created_at ON messages(created_at);\n' +
          'CREATE INDEX idx_messages_wa_id ON messages(wa_message_id);'
      );
    } else {
      tableVerified = true;
    }
  } catch (err) {
    console.error('Error checking messages table:', err);
  }
}

export async function logMessage(
  patientPhone: string,
  direction: 'inbound' | 'outbound',
  content: string,
  intent: string,
  waMessageId?: string
): Promise<void> {
  const supabase = getSupabaseServer();

  try {
    const insertData: Record<string, string> = {
      patient_phone: patientPhone,
      direction,
      content,
      intent,
    };

    if (waMessageId) {
      insertData.wa_message_id = waMessageId;
    }

    const { error } = await supabase.from('messages').insert(insertData);

    if (error) {
      console.error('Failed to log message to Supabase:', error);
    }
  } catch (err) {
    console.error('Error logging message:', err);
  }
}

export async function isDuplicateMessage(waMessageId: string): Promise<boolean> {
  const supabase = getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('wa_message_id', waMessageId)
      .limit(1);

    if (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }

    return (data ?? []).length > 0;
  } catch {
    return false;
  }
}

export async function getRecentMessages(
  patientPhone: string,
  limit: number = 6
): Promise<MessageRow[]> {
  const supabase = getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('patient_phone', patientPhone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent messages:', error);
      return [];
    }

    return ((data as MessageRow[]) ?? []).reverse();
  } catch {
    return [];
  }
}

export async function getAllPatients(): Promise<PatientSummary[]> {
  const supabase = getSupabaseServer();

  try {
    const { data, error } = await supabase.rpc('get_patient_summaries');

    if (error) {
      // Fallback: manual query if RPC doesn't exist
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (msgError || !messages) return [];

      const patientMap = new Map<string, PatientSummary>();

      for (const msg of messages as MessageRow[]) {
        if (!patientMap.has(msg.patient_phone)) {
          patientMap.set(msg.patient_phone, {
            patient_phone: msg.patient_phone,
            last_message: msg.content,
            last_message_at: msg.created_at,
            last_intent: msg.intent,
            total_messages: 0,
            first_contact: msg.created_at,
          });
        }

        const patient = patientMap.get(msg.patient_phone)!;
        patient.total_messages += 1;

        if (new Date(msg.created_at) < new Date(patient.first_contact)) {
          patient.first_contact = msg.created_at;
        }
      }

      return Array.from(patientMap.values()).sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime()
      );
    }

    return (data as PatientSummary[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPatientMessages(
  patientPhone: string
): Promise<MessageRow[]> {
  const supabase = getSupabaseServer();

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('patient_phone', patientPhone)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching patient messages:', error);
      return [];
    }

    return (data as MessageRow[]) ?? [];
  } catch {
    return [];
  }
}
