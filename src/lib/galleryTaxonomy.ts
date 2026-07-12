export const GALLERY_VEHICLE_MODELS = [
  { value: 'model-3', label: 'Model 3' },
  { value: 'model-y', label: 'Model Y' },
  { value: 'model-s', label: 'Model S' },
  { value: 'model-x', label: 'Model X' },
  { value: 'cybertruck', label: 'Cybertruck' },
  { value: 'other', label: 'Other' },
] as const;

export const GALLERY_OCCASIONS = [
  { value: 'general', label: 'General' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'halloween', label: 'Halloween' },
  { value: 'fourth-of-july', label: 'Fourth of July' },
  { value: 'st-patricks-day', label: "St. Patrick's Day" },
  { value: 'valentines-day', label: "Valentine's Day" },
  { value: 'new-years', label: "New Year's" },
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'easter', label: 'Easter' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'gender-reveal', label: 'Gender Reveal' },
  { value: 'baby-shower', label: 'Baby Shower' },
  { value: 'memorial-day', label: 'Memorial Day' },
  { value: 'veterans-day', label: "Veterans Day" },
  { value: 'mothers-day', label: "Mother's Day" },
  { value: 'fathers-day', label: "Father's Day" },
  { value: 'custom', label: 'Custom / Other' },
] as const;

export const GALLERY_GENRES = [
  { value: 'edm', label: 'EDM' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'country', label: 'Country' },
  { value: 'hip-hop', label: 'Hip-Hop' },
  { value: 'classical', label: 'Classical' },
  { value: 'dubstep', label: 'Dubstep' },
  { value: 'techno', label: 'Techno' },
  { value: 'trance', label: 'Trance' },
  { value: 'house', label: 'House' },
  { value: 'synthwave', label: 'Synthwave' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'soundtrack', label: 'Soundtrack' },
  { value: 'video-game', label: 'Video Game' },
  { value: 'other', label: 'Other' },
] as const;

export function getVehicleLabel(value: string | null): string {
  return GALLERY_VEHICLE_MODELS.find(v => v.value === value)?.label ?? value ?? '';
}

export function getOccasionLabel(value: string | null): string {
  return GALLERY_OCCASIONS.find(o => o.value === value)?.label ?? value ?? '';
}

export function getGenreLabel(value: string | null): string {
  return GALLERY_GENRES.find(g => g.value === value)?.label ?? value ?? '';
}
