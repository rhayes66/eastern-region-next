/** Member detail fields shown (read-only) on the profile and admin pages. */
export const PROFILE_DETAIL_FIELDS: [key: string, label: string][] = [
  ["title", "Title"],
  ["firstname", "First name"],
  ["lastname", "Last name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["finlandContact", "Finland contact"],
  ["gender", "Gender"],
  ["dateOfBirth", "Date of birth"],
  ["occupation", "Occupation"],
  ["address", "Address"],
  ["postalCode", "Postal code"],
  ["city", "City"],
  ["ghanacity", "Hometown in Ghana"],
  ["spousename", "Spouse"],
  ["children", "Children"],
  ["fathersname", "Father"],
  ["mothersname", "Mother"],
  ["nextkin", "Next of kin"],
  ["nextkinContact", "Next of kin contact"],
];

export const PROFILE_DETAIL_KEYS = PROFILE_DETAIL_FIELDS.map(([k]) => k);
