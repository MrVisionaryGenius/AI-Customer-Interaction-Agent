import { type NextRequest } from 'next/server';
import { getPatientMessages } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<Response> {
  const { phone } = await params;

  if (!phone) {
    return Response.json({ messages: [] }, { status: 400 });
  }

  // Decode the phone number (it may be URL-encoded, e.g., %2B for +)
  const decodedPhone = decodeURIComponent(phone);

  try {
    const messages = await getPatientMessages(decodedPhone);
    return Response.json({ messages });
  } catch (err) {
    console.error('Error fetching messages for', decodedPhone, ':', err);
    return Response.json({ messages: [] }, { status: 500 });
  }
}
