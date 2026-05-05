export const CLINIC_INFO = {
  name: 'Bright Smile Dental',
  address: '47 Harley Court, London W1G 8NE',
  nearestTube: "Regent's Park",
  phone: '020 7946 0312',
  email: 'hello@brightsmile.co.uk',
  hours: {
    weekdays: 'Mon–Fri 9am–6pm',
    saturday: 'Sat 9am–2pm',
    sunday: 'Closed Sunday',
  },
  leadDentist: {
    name: 'Dr. Sarah Okafor',
    qualifications: 'BDS, MFDS RCS',
  },
  team: {
    dentists: 3,
    hygienists: 2,
    receptionStaff: 4,
  },
} as const;

export const CLINIC_HOURS_TEXT = `${CLINIC_INFO.hours.weekdays}, ${CLINIC_INFO.hours.saturday}, ${CLINIC_INFO.hours.sunday}`;

export const CLINIC_SUMMARY = `${CLINIC_INFO.name} is located at ${CLINIC_INFO.address} (nearest tube: ${CLINIC_INFO.nearestTube}). Phone: ${CLINIC_INFO.phone}. Email: ${CLINIC_INFO.email}. Opening hours: ${CLINIC_HOURS_TEXT}. Lead dentist: ${CLINIC_INFO.leadDentist.name} (${CLINIC_INFO.leadDentist.qualifications}). The team includes ${CLINIC_INFO.team.dentists} dentists, ${CLINIC_INFO.team.hygienists} hygienists, and ${CLINIC_INFO.team.receptionStaff} reception staff.`;
