export const INTENT_CATEGORIES = [
  'booking_request',
  'pricing_query',
  'treatment_question',
  'emergency',
  'post_treatment_care',
  'hours_location',
  'insurance_payment',
  'general',
] as const;

export type IntentCategory = (typeof INTENT_CATEGORIES)[number];

export const INTENT_COLOURS: Record<IntentCategory, string> = {
  booking_request: '#2563EB',
  emergency: '#DC2626',
  pricing_query: '#059669',
  treatment_question: '#7C3AED',
  post_treatment_care: '#D97706',
  hours_location: '#6B7280',
  insurance_payment: '#0D9488',
  general: '#9CA3AF',
} as const;

export const INTENT_LABELS: Record<IntentCategory, string> = {
  booking_request: 'Booking',
  emergency: 'Emergency',
  pricing_query: 'Pricing',
  treatment_question: 'Treatment',
  post_treatment_care: 'Post-care',
  hours_location: 'Hours/Location',
  insurance_payment: 'Insurance',
  general: 'General',
} as const;

export function isValidIntent(value: string): value is IntentCategory {
  return INTENT_CATEGORIES.includes(value as IntentCategory);
}
