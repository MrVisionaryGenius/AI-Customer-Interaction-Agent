import { getAllPatients } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const patients = await getAllPatients();
    return Response.json({ patients });
  } catch (err) {
    console.error('Error fetching patients:', err);
    return Response.json({ patients: [] }, { status: 500 });
  }
}
