import { NextRequest } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logMessage } from '@/lib/supabase';
import { getBookingUrl } from '@/lib/calendly';

export const dynamic = 'force-dynamic';

interface SendBookingBody {
  phone: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as SendBookingBody;
    const { phone } = body;

    if (!phone) {
      return Response.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const bookingUrl = getBookingUrl();

    if (!bookingUrl) {
      return Response.json(
        { success: false, error: 'Booking URL not configured' },
        { status: 500 }
      );
    }

    const message = `We'd love to get you booked in. Here's the link to find a slot that works for you — it only takes a minute: ${bookingUrl}\n\nOnce you've booked, you'll get a confirmation by email. If you need to change anything, just let us know here 😊`;

    const result = await sendWhatsAppMessage(phone, message);

    if (result.success) {
      try {
        await logMessage(phone, 'outbound', message, 'booking_request');
      } catch (err) {
        console.error('Failed to log booking message:', err);
      }

      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  } catch (err) {
    console.error('Send booking error:', err);
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
