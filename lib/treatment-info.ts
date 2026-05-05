export interface Treatment {
  name: string;
  price: string;
  description: string;
}

export const TREATMENTS: Treatment[] = [
  {
    name: 'New patient checkup',
    price: '£65',
    description:
      'Full examination including X-rays if needed. Takes about 30 minutes. Dentist checks teeth, gums, mouth, jaw. Good starting point for any new patient — no referral needed.',
  },
  {
    name: 'Emergency appointment',
    price: '£85',
    description:
      'Same-day or next-day slot for urgent issues. Dentist assesses the problem, provides immediate pain relief or temporary treatment, then books follow-up if needed. 20–30 minutes.',
  },
  {
    name: 'Scale & polish (hygienist)',
    price: '£75',
    description:
      'Done by a hygienist. Removes plaque and tartar buildup, then polishes teeth. Takes 30–45 minutes. Recommended every 6 months. Mild sensitivity possible for a day or two after.',
  },
  {
    name: 'Teeth whitening (take-home)',
    price: '£299',
    description:
      'Custom trays made from impressions. Patient applies gel at home for 2 weeks. Results in 2–4 shades lighter. Requires one fitting appointment (20 mins) then collect trays a week later.',
  },
  {
    name: 'Teeth whitening (in-chair, 1hr)',
    price: '£450',
    description:
      'Single 1-hour appointment. Stronger gel applied with protective barriers. Immediate results, typically 6–8 shades. Some sensitivity for 24–48 hours is normal.',
  },
  {
    name: 'Composite bonding (per tooth)',
    price: '£180',
    description:
      'Tooth-coloured resin applied and shaped by hand, cured with UV light. Fixes chips, gaps, reshapes teeth. 30–60 minutes per tooth. No drilling in most cases. Lasts 5–7 years with care.',
  },
  {
    name: 'Porcelain veneers (per tooth)',
    price: '£750',
    description:
      'Thin porcelain shells bonded to front of teeth. Two appointments — first for prep and impressions (1hr), second for fitting (1hr). Lasts 10–15 years. Small amount of enamel removed so this is permanent.',
  },
  {
    name: 'Invisalign (full treatment)',
    price: 'from £2,800',
    description:
      'Clear aligners that straighten teeth over 6–18 months depending on case. Requires initial scan and consultation, then aligners changed every 1–2 weeks. Check-ups every 6–8 weeks. Must be worn 22hrs/day.',
  },
  {
    name: 'Dental implant (single, full)',
    price: 'from £2,200',
    description:
      'Titanium post placed in jawbone, heals for 3–6 months, then crown fitted on top. Full process takes 4–9 months. Requires initial consultation with X-rays/CT scan. Not suitable for everyone — bone density assessment needed.',
  },
  {
    name: 'Tooth extraction (simple)',
    price: '£120',
    description:
      'Local anaesthetic, tooth removed, takes 20–30 minutes. Some swelling and tenderness for 2–3 days. Stitches sometimes needed.',
  },
  {
    name: 'Root canal treatment',
    price: 'from £350',
    description:
      'Removes infected pulp from inside the tooth. 1–2 appointments, 60–90 minutes each. Saves the tooth from extraction. Crown usually recommended after to protect the tooth.',
  },
  {
    name: 'White fillings',
    price: 'from £95',
    description:
      'Tooth-coloured composite replaces decay. 30–45 minutes. Numbing with local anaesthetic. Eat and drink normally after numbness wears off (1–2 hours).',
  },
  {
    name: 'Dental bridge (3 unit)',
    price: 'from £1,800',
    description:
      'Replacement tooth held in place by crowns on adjacent teeth. Two appointments — prep and impressions, then fitting. Takes about 2 weeks total. Lasts 10–15 years.',
  },
  {
    name: "Children's checkup (under 18)",
    price: '£45',
    description:
      'Gentle exam for under 18s. Dentist checks development, decay, and gives oral hygiene advice. Takes 20 minutes. Parents welcome in the room.',
  },
];

export const TREATMENTS_SUMMARY = TREATMENTS.map(
  (t) => `${t.name}: ${t.price}. ${t.description}`
).join('\n\n');

export const TREATMENTS_PRICE_LIST = TREATMENTS.map(
  (t) => `${t.name}: ${t.price}`
).join('\n');
