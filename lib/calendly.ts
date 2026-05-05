interface CalendlyAvailabilityResult {
  available: boolean;
  bookingUrl: string;
  error?: string;
}

export async function checkCalendlyAvailability(): Promise<CalendlyAvailabilityResult> {
  const apiKey = process.env.CALENDLY_API_KEY;
  const eventUrl = process.env.CALENDLY_EVENT_URL;

  if (!apiKey || !eventUrl) {
    return {
      available: false,
      bookingUrl: eventUrl ?? '',
      error: 'Calendly not configured',
    };
  }

  try {
    // Check if the event type is active and available
    const response = await fetch('https://api.calendly.com/event_types', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Calendly API error:', response.status);
      return {
        available: false,
        bookingUrl: eventUrl,
        error: `API returned ${response.status}`,
      };
    }

    // If we get a valid response, assume availability
    return {
      available: true,
      bookingUrl: eventUrl,
    };
  } catch (err) {
    console.error('Calendly check failed:', err);
    return {
      available: false,
      bookingUrl: eventUrl,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export function getBookingUrl(): string {
  return process.env.CALENDLY_EVENT_URL ?? '';
}
