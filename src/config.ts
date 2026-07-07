// ============================================================
// Central config — edit prices and snippet length here
// ============================================================

export const SNIPPET_SECONDS = 20;

export const PACKAGES = [
  {
    id: 'single',
    name: '1 Download',
    credits: 1,
    price_cents: 999,
    label: '$9.99',
    description: 'One full-length light show download.',
  },
  {
    id: 'triple',
    name: '3 Downloads',
    credits: 3,
    price_cents: 2199,
    label: '$21.99',
    description: 'Three downloads. Best for trying multiple songs.',
    badge: 'Popular',
  },
  {
    id: 'ten',
    name: '10 Downloads',
    credits: 10,
    price_cents: 4999,
    label: '$49.99',
    description: 'Ten downloads at the best per-show rate.',
    badge: 'Best Value',
  },
] as const;

export type PackageId = (typeof PACKAGES)[number]['id'];
