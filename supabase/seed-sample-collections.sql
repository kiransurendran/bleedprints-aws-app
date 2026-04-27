delete from public.collections
where slug in (
  'archival-ink-print',
  'fine-art-collection',
  'pop-art-series',
  'minimalist-decor',
  'brutalist-forms',
  'chromatic-fields',
  'fluid-motion',
  'graphic-studies',
  'lightfall-editions',
  'concrete-echoes',
  'nocturne-palette',
  'soft-minimalism'
);

insert into public.collections (slug, title, description, sort_order, is_active)
values
  ('abstract', 'Abstract', 'Expressive abstract compositions with layered color, geometry, and movement.', 0, true),
  ('minimalist', 'Minimalist', 'Clean, quiet artwork designed for restrained interiors and uncluttered walls.', 1, true),
  ('photography', 'Photography', 'Photographic prints spanning architectural, landscape, and mood-led visual studies.', 2, true),
  ('vintage', 'Vintage', 'Retro-inspired and classic print styles with aged palettes and nostalgic character.', 3, true),
  ('pop-art', 'Pop Art', 'Bold, color-forward artwork with graphic energy and playful contrast.', 4, true),
  ('uncategorized', 'Uncategorized', 'Temporary fallback bucket for products that have not been assigned to a collection yet.', 5, true)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());
